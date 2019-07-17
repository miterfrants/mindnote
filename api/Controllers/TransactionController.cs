using System.Net;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;

using System;
using System.Text;
using System.Net.Http;
using System.Threading.Tasks;
using System.Threading;

using Mindnote.Util;
using Mindnote.Models;
using Mindnote.Services;
using Mindnote.Constants;
using Mindnote.Helpers;

namespace Mindnote.Controllers
{
    [Authorize]
    [Route("mindnote/api/v1/")]
    [ApiController]
    public class CheckoutController : ControllerBase
    {

        private readonly MindnoteContext _context;
        private readonly MindnoteContextForView _contextForView;
        private readonly UserService _userService;
        private readonly String _tapPayPartnerKey;
        private readonly String _tapPayEndpoint;
        public CheckoutController(IOptions<AppSettings> appSetting, MindnoteContext context, UserService userService, MindnoteContextForView contextForView)
        {
            _context = context;
            _userService = userService;
            _contextForView = contextForView;

            AppSettings tempAppSetting = (AppSettings)appSetting.Value;
            _tapPayEndpoint = tempAppSetting.Common.TapPayEndpoint;
            _tapPayPartnerKey = tempAppSetting.Secrets.TapPayPartnerKey;
        }

        [HttpDelete]
        [Route("transaction/")]
        public ActionResult<dynamic> Unsubscribe()
        {
            string authorization = Request.Headers["Authorization"];
            string token = authorization.Substring("Bearer ".Length).Trim();
            Int32 userId = _userService.GetUserId(token);
            view_user user = _contextForView.view_user.FirstOrDefault(x => x.id == userId);

            if (!user.is_subscribed)
            {
                throw new MindnoteException("痾～你好像不是訂閱用戶", HttpStatusCode.ExpectationFailed);
            }

            transaction existedTransaction = _context.transaction.FirstOrDefault(x => x.id == user.transaction_id);
            if (!existedTransaction.is_next_subscribe)
            {
                throw new MindnoteException("已經取消訂閱囉～下一期我們將停止扣款");
            }

            // transaction existedTransaction = new transaction { id = user.transaction_id ?? -1 };
            // _context.Attach<transaction>(existedTransaction);

            existedTransaction.is_next_subscribe = false;
            _context.SaveChanges();

            JSONResponse json = new JSONResponse(JSONResponseStatus.OK, new { });
            return json.toResponseObj();
        }

        [HttpPost]
        [Route("transaction/")]
        async public Task<dynamic> Checkout([FromBody] dynamic requestBody)
        {
            // initialize local transaction data
            string authorization = Request.Headers["Authorization"];
            string token = authorization.Substring("Bearer ".Length).Trim();
            Int16 userId = _userService.GetUserId(token);
            view_user view_user = _contextForView.view_user.FirstOrDefault(x => x.id == userId);
            if (view_user.is_subscribed)
            {
                throw new MindnoteException("你已經是我們的訂閱用戶", HttpStatusCode.ExpectationFailed);
            }
            transaction newTransaction = null;
            try
            {
                if (requestBody.prime != null)
                {
                    newTransaction = new transaction
                    {
                        method = Enum.GetName(typeof(TransactionMethod), TransactionMethod.TAP_PAY),
                        owner_id = userId,
                        status = Enum.GetName(typeof(TransactionStatus), TransactionStatus.PENDING),
                        phone = requestBody.phone,
                        card_holder = requestBody.card_holder,
                        email = requestBody.email,
                        amount = 99
                    };
                    _context.transaction.Add(newTransaction);
                    _context.SaveChanges();
                }
            }
            catch (System.Exception ex)
            {
                throw new MindnoteException("交易失敗:" + ex.Message, HttpStatusCode.InternalServerError);
            }

            // send transaction data to tap pay
            HttpClient httpClient = new HttpClient();

            var postBody = new
            {
                prime = requestBody.prime,
                partner_key = _tapPayPartnerKey,
                merchant_id = "hahow_CTBC",
                details = "Mindnote Subscription",
                amount = 99,
                cardholder = new
                {
                    phone_number = requestBody.phone,
                    name = requestBody.card_holder,
                    email = requestBody.email
                },
                remember = true
            };
            httpClient.DefaultRequestHeaders.Add("x-api-key", _tapPayPartnerKey);
            StringContent httpContent = new StringContent(Newtonsoft.Json.JsonConvert.SerializeObject(postBody), Encoding.UTF8, "application/json");
            HttpResponseMessage response = await httpClient.PostAsync(_tapPayEndpoint, httpContent);
            string resultFromTapPay = await response.Content.ReadAsStringAsync();
            dynamic resultObjFromTapPay = Newtonsoft.Json.JsonConvert.DeserializeObject(resultFromTapPay);

            // update local transaction status
            user user = _context.user.FirstOrDefault(x => x.id == userId);
            JSONResponse result;
            if ((int)response.StatusCode == StatusCodes.Status200OK)
            {

                newTransaction.raw_data = resultFromTapPay;
                if (resultObjFromTapPay.status == 0)
                {
                    newTransaction.status = Enum.GetName(typeof(TransactionStatus), TransactionStatus.PAID);
                }
                newTransaction.paid_at = DateTime.Now;
                user.phone = requestBody.phone;
                user.full_name = requestBody.card_holder;
                user.email = requestBody.email;
                _context.SaveChanges();

                if (resultObjFromTapPay.status != 0)
                {
                    throw new MindnoteException(resultObjFromTapPay.msg.Value, HttpStatusCode.InternalServerError);
                }


                result = new JSONResponse(JSONResponseStatus.OK, new
                {
                    data = resultFromTapPay
                });
                return result.toResponseObj();
            }
            else
            {
                result = new JSONResponse(JSONResponseStatus.FAILED, new
                {
                    data = response
                });
                return result.toResponseObj();
            }

        }
    }
}