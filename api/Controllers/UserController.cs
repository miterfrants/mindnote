using System;
using System.Net;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Dynamic;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

using Mindnote.Models;
using Mindnote.Services;
using Mindnote.Util;
using Mindnote.Helpers;

using Google.Apis.Auth.OAuth2;
using Google.Cloud.Storage.V1;

namespace Mindnote.Controllers
{
    [Authorize]
    [Route("mindnote/api/v1/users/")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly MindnoteContext _context;
        private readonly MindnoteContextForView _contextForView;
        private readonly UserService _userService;
        private readonly string _GCPProjectId;
        private readonly string _GCSBucketName;
        private readonly string _GCSCredential;
        public UserController(IOptions<AppSettings> appSetting, MindnoteContext context, MindnoteContextForView contextForView, UserService userService)
        {
            _context = context;
            _contextForView = contextForView;
            _userService = userService;

            AppSettings tempAppSetting = (AppSettings)appSetting.Value;
            _GCPProjectId = tempAppSetting.Common.GCPProjectId;
            _GCSBucketName = tempAppSetting.Common.GCSBucketName;
            _GCSCredential = tempAppSetting.Secrets.GCSCredential;
        }

        [HttpGet]
        [Route("me/")]
        public ActionResult<dynamic> Get()
        {
            string authorization = Request.Headers["Authorization"];
            string token = authorization.Substring("Bearer ".Length).Trim();

            Int16 userId = _userService.GetUserId(token);
            view_user user = _contextForView.view_user.FirstOrDefault(x => x.id == userId);
            if (user == null)
            {
                throw new MindnoteException("你不是帳號的擁有者", HttpStatusCode.NotFound);
            }
            else
            {
                return new
                {
                    username = user.username,
                    fullname = user.full_name,
                    email = user.email,
                    phone = user.phone,
                    is_subscribed = user.is_subscribed,
                    is_next_subscribe = user.is_next_subscribe
                };
            }
        }

        [HttpPost]
        [Route("me/images/")]
        public ActionResult<dynamic> PostImages([FromBody] dynamic requestBody)
        {
            string authorization = Request.Headers["Authorization"];
            string token = authorization.Substring("Bearer ".Length).Trim();

            Int16 userId = _userService.GetUserId(token);
            view_user user = _contextForView.view_user.FirstOrDefault(x => x.id == userId);
            if (user == null)
            {
                throw new MindnoteException("你不是帳號的擁有者", HttpStatusCode.NotFound);
            }
            GoogleCredential gc = GoogleCredential.FromJson(_GCSCredential);
            StorageClient client = StorageClient.Create(gc);
            for (int i = 0; i < requestBody.base64Files.Count; i++)
            {
                //check all file content type;
                string contentType = requestBody.base64Files[i].contentType.Value;
                if (!contentType.StartsWith("image/"))
                {
                    throw new MindnoteException("你上傳了非圖片的檔案");
                }
            }

            // post to gcs
            List<dynamic> result = new List<dynamic>();
            for (int i = 0; i < requestBody.base64Files.Count; i++)
            {
                //check all file content type;
                string base64Data = requestBody.base64Files[i].data.Value;
                string contentType = requestBody.base64Files[i].contentType.Value;
                string clientSideFlagId = requestBody.base64Files[i].clientSideFlagId != null ? requestBody.base64Files[i].clientSideFlagId.Value : "";
                decimal width = -1;
                if (requestBody.base64Files[i].width != null)
                {
                    width = (decimal)requestBody.base64Files[i].width.Value;
                }
                decimal height = -1;
                if (requestBody.base64Files[i].height != null)
                {
                    height = (decimal)requestBody.base64Files[i].height.Value;
                }

                int nodeId = -1;
                if (requestBody.base64Files[i].nodeId != null)
                {
                    nodeId = (int)requestBody.base64Files[i].nodeId.Value;
                }
                string extensionFilename = ".jpg";
                if (contentType == "image/jpg" || contentType == "image/jpeg")
                {
                    extensionFilename = ".jpg";
                }
                else if (contentType == "image/png")
                {
                    extensionFilename = ".png";
                }
                else if (contentType == "image/gif")
                {
                    extensionFilename = ".gif";
                }
                else if (contentType == "image/bmp")
                {
                    extensionFilename = ".bmp";
                }
                else
                {
                    extensionFilename = contentType.Replace("image/", "");
                }
                string id = Guid.NewGuid().ToString("N");

                MemoryStream stream = new MemoryStream(Convert.FromBase64String(base64Data));
                Decimal size = stream.Length;
                if ((user.storage_usage + size) / 1024 / 1024 > 200)
                {
                    throw new MindnoteException("上傳的圖片已經超過免費使用者的上限 (200 M)，只要每月 99 元，就能享有 100 倍的上傳空間", HttpStatusCode.ExpectationFailed);
                }
                else if ((user.storage_usage + size) / 1024 / 1024 / 1024 > 20)
                {
                    throw new MindnoteException("上傳的圖片已經超過付費使用者的上限 (20 G)，請聯繫管理員 miterfrants@gmail.com", HttpStatusCode.InternalServerError);
                }
                Google.Apis.Storage.v1.Data.Object resultFromGCS = client.UploadObject(_GCSBucketName, id + extensionFilename, contentType, stream, new UploadObjectOptions()
                {
                    UserProject = _GCPProjectId,
                });
                JSONResponseStatus status = JSONResponseStatus.OK;
                if (resultFromGCS.Name == null)
                {
                    status = JSONResponseStatus.FAILED;
                }

                dynamic resultItem = new ExpandoObject();
                resultItem.status = Enum.GetName(typeof(JSONResponseStatus), status);
                resultItem.filename = resultFromGCS.Name;
                resultItem.clientSideFlagId = clientSideFlagId ?? "";
                resultItem.nodeId = nodeId;
                resultItem.size = resultFromGCS.Size;
                resultItem.width = width;
                resultItem.height = height;

                result.Add(resultItem);
            }

            // check gcs result and save local db
            for (int i = 0; i < result.Count; i++)
            {
                if (result[i].status == Enum.GetName(typeof(JSONResponseStatus), JSONResponseStatus.OK))
                {
                    image image = new image
                    {
                        owner_id = userId,
                        filename = result[i].filename,
                        size = result[i].size,
                    };
                    if (result[i].width != -1)
                    {
                        image.width = result[i].width;
                    }
                    if (result[i].height != -1)
                    {
                        image.height = result[i].height;
                    }

                    if (result[i].nodeId != -1)
                    {
                        image.node_id = result[i].nodeId;
                    }

                    result[i].imageContext = image;
                    _context.image.Add(image);
                }
            }
            _context.SaveChanges();

            return result;
        }
    }
}