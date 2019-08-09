using System;
using System.Net;
using System.Linq;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

using Mindnote.Models;
using Mindnote.Services;
using Mindnote.Util;

namespace Mindnote.Controllers
{
    [Authorize]
    [Route("mindnote/api/v1/users/me/boards/{boardId}/")]
    [ApiController]
    public class UserBoardController : ControllerBase
    {
        private readonly MindnoteContext _context;
        private readonly MindnoteContextForView _contextForView;
        private readonly UserService _userService;
        public UserBoardController(MindnoteContext context, MindnoteContextForView contextForView, UserService userService)
        {
            _context = context;
            _contextForView = contextForView;
            _userService = userService;
        }
        [HttpGet]
        public ActionResult<view_board> GetBoard([FromRoute] Int32 boardId)
        {
            string authorization = Request.Headers["Authorization"];
            string token = authorization.Substring("Bearer ".Length).Trim();
            Int16 userId = _userService.GetUserId(token);

            view_board board = _contextForView.view_board.FirstOrDefault(x => x.id == boardId && x.owner_id == userId && x.deleted_at == null);
            if (board == null)
            {
                throw new MindnoteException("嗚喔！ 分類已經被刪除，無法瀏覽", HttpStatusCode.NotFound);
            }
            return board;
        }

        [HttpDelete]
        public ActionResult<dynamic> DeleteBoard([FromRoute] Int32 boardId)
        {
            string authorization = Request.Headers["Authorization"];
            string token = authorization.Substring("Bearer ".Length).Trim();
            Int16 userId = _userService.GetUserId(token);

            board board = _context.board.FirstOrDefault(x => x.id == boardId && x.owner_id == userId && x.deleted_at == null);
            if (board == null)
            {
                throw new MindnoteException("嗚喔！ 分類已經被刪除，無法瀏覽", HttpStatusCode.NotFound);
            }
            board.deleted_at = DateTime.Now;
            _context.SaveChanges();

            JSONResponse result = new JSONResponse(JSONResponseStatus.OK, new { });
            return result.toResponseObj();
        }

        [HttpPatch]
        public ActionResult<board> PatchBoard([FromRoute] Int32 boardId, [FromBody] dynamic requestBody)
        {
            string authorization = Request.Headers["Authorization"];
            string token = authorization.Substring("Bearer ".Length).Trim();
            Int16 userId = _userService.GetUserId(token);

            board board = _context.board.FirstOrDefault(x => x.id == boardId && x.owner_id == userId && x.deleted_at == null);
            if (board == null)
            {
                throw new MindnoteException("嗚喔！ 分類已經被刪除，無法瀏覽", HttpStatusCode.NotFound);
            }

            if (requestBody.is_public != null)
            {
                board.is_public = requestBody.is_public;
            }

            if (requestBody.title != null)
            {
                board.title = requestBody.title;
            }
            if (requestBody.uniquename != null)
            {
                board.uniquename = requestBody.uniquename;
            }
            if (requestBody.image_id != null && board.image_id != (int)requestBody.image_id)
            {
                if (board.image_id != null)
                {
                    image existedImage = new image { id = (board.image_id ?? -1) };
                    Console.WriteLine((board.image_id ?? -1));
                    _context.Attach<image>(existedImage);
                    existedImage.deleted_at = DateTime.Now;
                }
                board.image_id = requestBody.image_id;
            }

            _context.SaveChanges();
            return board;
        }
    }
}