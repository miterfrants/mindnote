using System;
using System.Net;
using System.Collections.Generic;
using System.Linq;
using System.IO;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

using Mindnote.Models;
using Mindnote.Services;
using Mindnote.Util;

using Newtonsoft.Json.Linq;

using Google.Apis.Auth.OAuth2;
using Google.Cloud.Storage.V1;

namespace Mindnote.Controllers
{
    [Authorize]
    [Route("mindnote/api/v1/users/me/boards/")]
    [ApiController]
    public class UserBoardsController : ControllerBase
    {
        private readonly MindnoteContext _context;
        private readonly MindnoteContextForView _contextForView;
        private readonly UserService _userService;
        public UserBoardsController(MindnoteContext context, MindnoteContextForView contextForView, UserService userService)
        {
            _context = context;
            _contextForView = contextForView;
            _userService = userService;
        }

        [HttpGet]
        public ActionResult<List<board>> GetBoards([FromQuery] Int32? limit)
        {
            string authorization = Request.Headers["Authorization"];
            string token = authorization.Substring("Bearer ".Length).Trim();
            Int16 userId = _userService.GetUserId(token);
            List<board> boards;
            if (limit != null)
            {
                boards = _context.board.Where(x => x.owner_id == userId && x.deleted_at == null).OrderByDescending(x => x.created_at).Take(limit ?? 5).ToList();
            }
            else
            {
                boards = _context.board.Where(x => x.owner_id == userId && x.deleted_at == null).OrderByDescending(x => x.created_at).ToList();
            }
            return boards;
        }

        [HttpPost]
        public ActionResult<board> PostBoard([FromBody] dynamic body)
        {
            string authorization = Request.Headers["Authorization"];
            string token = authorization.Substring("Bearer ".Length).Trim();
            Int32 userId = _userService.GetUserId(token);

            view_user user = _contextForView.view_user.FirstOrDefault(x => x.id == userId);

            if (user.board_count >= 2 && !user.is_subscribed)
            {
                // throw new MindnoteException("Add board deny, because free account only have two boards. If you need to create new board, join us just pay $3 per month to subscribe our service.", HttpStatusCode.ExpectationFailed);
                throw new MindnoteException("因為免費使用者只有兩個分類可以使用，所以新增分類失敗，如果你需要更多的分類來整理筆記，一個月只需要 $ 99 元，就能使用無限多的分類，請點擊這則訊息進入到付款流程。", HttpStatusCode.ExpectationFailed);
            }

            board newBoard = new board { title = body.title, uniquename = body.uniquename, owner_id = userId };
            _context.board.Add(newBoard);
            _context.SaveChanges();

            return _context.board.SingleOrDefault(rec => rec.id == newBoard.id);
        }
    }
}