using System;
using System.Net;
using System.Collections.Generic;
using System.Linq;
using System.IO;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

using Mindmap.Models;
using Mindmap.Services;
using Mindmap.Util;
using Mindmap.Helpers;

using Google.Apis.Auth.OAuth2;
using Google.Cloud.Storage.V1;

namespace Mindmap.Controllers
{
    [Authorize]
    [Route("mindmap/api/v1/users/")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly MindmapContext _context;
        private readonly MindmapContextForView _contextForView;
        private readonly UserService _userService;
        private readonly string _GCPProjectId;
        private readonly string _GCSBucketName;
        private readonly string _GCSCredential;
        public UserController(IOptions<AppSettings> appSetting, MindmapContext context, MindmapContextForView contextForView, UserService userService)
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
                throw new MindMapException("你不是帳號的擁有者", HttpStatusCode.NotFound);
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
                throw new MindMapException("你不是帳號的擁有者", HttpStatusCode.NotFound);
            }
            GoogleCredential gc = GoogleCredential.FromJson(_GCSCredential);
            StorageClient client = StorageClient.Create(gc);
            for (int i = 0; i < requestBody.base64Files.Count; i++)
            {
                //check all file content type;
                string contentType = requestBody.base64Files[i].contentType.Value;
                if (!contentType.StartsWith("image/"))
                {
                    throw new MindMapException("你上傳了非圖片的檔案");
                }
            }

            // post to gcs
            List<dynamic> result = new List<dynamic>();
            for (int i = 0; i < requestBody.base64Files.Count; i++)
            {
                //check all file content type;
                string base64Data = requestBody.base64Files[i].data.Value;
                string contentType = requestBody.base64Files[i].contentType.Value;
                string tempId = requestBody.base64Files[i].tempId.Value;
                int nodeId = (int)requestBody.base64Files[i].nodeId.Value;
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
                Google.Apis.Storage.v1.Data.Object resultFromGCS = client.UploadObject(_GCSBucketName, id + extensionFilename, contentType, stream, new UploadObjectOptions()
                {
                    UserProject = _GCPProjectId,
                });
                JSONResponseStatus status = JSONResponseStatus.OK;
                if (resultFromGCS.Name == null)
                {
                    status = JSONResponseStatus.FAILED;
                }
                result.Add(new
                {
                    status = Enum.GetName(typeof(JSONResponseStatus), status),
                    newId = resultFromGCS.Name,
                    tempId = tempId,
                    nodeId = nodeId
                });
            }

            // check gcs result and save local db
            for (int i = 0; i < result.Count; i++)
            {
                if (result[i].status == Enum.GetName(typeof(JSONResponseStatus), JSONResponseStatus.OK))
                {
                    image image = new image { owner_id = userId, filename = result[i].newId, node_id = result[i].nodeId };
                    _context.image.Add(image);
                }
            }
            _context.SaveChanges();
            return result;
        }
    }
}