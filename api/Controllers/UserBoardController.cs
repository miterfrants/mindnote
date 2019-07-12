using System;
using System.Net;
using System.Linq;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

using Mindmap.Models;
using Mindmap.Services;
using Mindmap.Util;

namespace Mindmap.Controllers
{
    [Authorize]
    [Route("mindmap/api/v1/users/me/boards/{boardId}/")]
    [ApiController]
    public class UserBoardController : ControllerBase
    {
        private readonly MindmapContext _context;
        private readonly MindmapContextForView _contextForView;
        private readonly UserService _userService;
        public UserBoardController(MindmapContext context, MindmapContextForView contextForView, UserService userService)
        {
            _context = context;
            _contextForView = contextForView;
            _userService = userService;
        }
        [HttpGet]
        public ActionResult<board> GetBoard([FromRoute] Int32 boardId)
        {
            string authorization = Request.Headers["Authorization"];
            string token = authorization.Substring("Bearer ".Length).Trim();
            Int16 userId = _userService.GetUserId(token);

            board board = _context.board.FirstOrDefault(x => x.id == boardId && x.owner_id == userId && x.deleted_at == null);
            if (board == null)
            {
                throw new MindMapException("嗚喔！ 分類已經被刪除，無法瀏覽", HttpStatusCode.NotFound);
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
                throw new MindMapException("嗚喔！ 分類已經被刪除，無法瀏覽", HttpStatusCode.NotFound);
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
                throw new MindMapException("嗚喔！ 分類已經被刪除，無法瀏覽", HttpStatusCode.NotFound);
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
            _context.SaveChanges();
            return board;
        }
    }
}