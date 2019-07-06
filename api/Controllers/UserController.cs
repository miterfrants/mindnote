using System;
using System.Net;
using System.Collections.Generic;
using System.Linq;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

using Mindmap.Models;
using Mindmap.Services;
using Mindmap.Util;

using Newtonsoft.Json.Linq;

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
        public UserController(MindmapContext context, MindmapContextForView contextForView, UserService userService)
        {
            _context = context;
            _contextForView = contextForView;
            _userService = userService;
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

        [HttpGet]
        [Route("me/boards/")]
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
        [Route("me/boards/")]
        public ActionResult<board> PostBoard([FromBody] dynamic body)
        {
            string authorization = Request.Headers["Authorization"];
            string token = authorization.Substring("Bearer ".Length).Trim();
            Int32 userId = _userService.GetUserId(token);

            view_user user = _contextForView.view_user.FirstOrDefault(x => x.id == userId);

            if (user.board_count >= 2 && !user.is_subscribed)
            {
                // throw new MindMapException("Add board deny, because free account only have two boards. If you need to create new board, join us just pay $3 per month to subscribe our service.", HttpStatusCode.ExpectationFailed);
                throw new MindMapException("因為免費使用者只有兩個分類可以使用，所以新增分類失敗，如果你需要更多的分類來整理筆記，一個月只需要 $ 99 元，就能使用無限多的分類，請點擊這則訊息進入到付款流程。", HttpStatusCode.ExpectationFailed);
            }

            board newBoard = new board { title = body.title, uniquename = body.uniquename, owner_id = userId };
            _context.board.Add(newBoard);
            _context.SaveChanges();

            return _context.board.SingleOrDefault(rec => rec.id == newBoard.id);
        }

        [HttpGet]
        [Route("me/boards/{boardId}/")]
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
        [Route("me/boards/{boardId}/")]
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
        [Route("me/boards/{boardId}/")]
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

        [HttpGet]
        [Route("me/boards/{boardId}/nodes/")]
        public ActionResult<List<view_node>> GetNodesInBoard([FromRoute] Int32 boardId)
        {
            string authorization = Request.Headers["Authorization"];
            string token = authorization.Substring("Bearer ".Length).Trim();
            Int16 userId = _userService.GetUserId(token);
            board board = _context.board.FirstOrDefault(x => x.id == boardId && x.owner_id == userId && x.deleted_at == null);

            if (board == null)
            {
                throw new MindMapException("嗚喔！ 分類已經被刪除，無法瀏覽", HttpStatusCode.NotFound);
            }

            List<view_node> nodes = _contextForView.view_node.Where(x => x.board_id == board.id && x.deleted_at == null).ToList();
            return nodes;
        }

        [HttpGet]
        [Route("me/boards/{boardId}/relationship/")]
        public ActionResult<List<view_node_relationship>> GetRelationshipInBoard([FromRoute] Int32 boardId)
        {
            string authorization = Request.Headers["Authorization"];
            string token = authorization.Substring("Bearer ".Length).Trim();
            Int16 userId = _userService.GetUserId(token);
            board board = _context.board.FirstOrDefault(x => x.id == boardId && x.owner_id == userId && x.deleted_at == null);

            if (board == null)
            {
                throw new MindMapException("嗚喔！ 分類已經被刪除，無法瀏覽", HttpStatusCode.NotFound);
            }

            return _contextForView.view_node_relationship.Where(x => x.board_id == board.id).ToList();
        }

        [HttpPost]
        [Route("me/boards/{boardId}/relationship/")]
        public ActionResult<node_relationship> PostRelationshipInBoard([FromRoute] Int32 boardId, [FromBody] dynamic body)
        {
            string authorization = Request.Headers["Authorization"];
            string token = authorization.Substring("Bearer ".Length).Trim();
            Int16 userId = _userService.GetUserId(token);
            board board = _context.board.FirstOrDefault(x => x.id == boardId && x.owner_id == userId && x.deleted_at == null);

            if (board == null)
            {
                throw new MindMapException("嗚喔！ 分類已經被刪除，無法瀏覽", HttpStatusCode.NotFound);
            }

            node_relationship nodeRelationship = new node_relationship { parent_node_id = body.parent_node_id, child_node_id = body.child_node_id };
            _context.node_relationship.Add(nodeRelationship);
            _context.SaveChanges();
            return nodeRelationship;
        }

        [HttpPost]
        [Route("me/boards/{boardId}/nodes/")]
        public ActionResult<view_node> PostNode([FromRoute] Int32 boardId, [FromBody] dynamic node)
        {
            string authorization = Request.Headers["Authorization"];
            string token = authorization.Substring("Bearer ".Length).Trim();

            Int16 userId = _userService.GetUserId(token);
            board board = _context.board.FirstOrDefault(x => x.id == boardId && x.owner_id == userId && x.deleted_at == null);

            if (board == null)
            {
                throw new MindMapException("嗚喔！ 分類已經被刪除，無法瀏覽", HttpStatusCode.NotFound);
            }

            node newNode = new node { title = node.title, description = node.description, owner_id = userId, board_id = board.id };
            _context.node.Add(newNode);
            _context.SaveChanges();

            if (node.parent_node_id != null)
            {
                node_relationship nodeRelationship = new node_relationship { parent_node_id = node.parent_node_id, child_node_id = newNode.id };
                _context.node_relationship.Add(nodeRelationship);
                _context.SaveChanges();
            }

            return _contextForView.view_node.SingleOrDefault(rec => rec.id == newNode.id);
        }

        [HttpPatch]
        [Route("me/boards/{boardId}/nodes/")]
        public ActionResult<List<view_node>> PatchNodes([FromRoute] Int32 boardId, [FromBody] dynamic requestBody)
        {

            string authorization = Request.Headers["Authorization"];
            string token = authorization.Substring("Bearer ".Length).Trim();

            Int16 userId = _userService.GetUserId(token);
            board board = _context.board.FirstOrDefault(x => x.id == boardId && x.owner_id == userId && x.deleted_at == null);

            if (board == null)
            {
                throw new MindMapException("嗚喔！ 分類已經被刪除，無法瀏覽", HttpStatusCode.NotFound);
            }
            var nodes = ((JArray)requestBody.nodes).ToList();
            List<Int32> nodeIds = new List<Int32>();
            for (int i = 0; i < nodes.Count; i++)
            {
                dynamic nodeFromRequest = nodes[i];
                node existedNode = new node { id = nodeFromRequest.id };
                _context.Attach<node>(existedNode);
                existedNode.x = nodeFromRequest.x;
                existedNode.y = nodeFromRequest.y;
                nodeIds.Add((Int32)nodeFromRequest.id);
            }
            _context.SaveChanges();
            return _contextForView.view_node.Where(x => x.board_id == board.id && x.deleted_at == null && nodeIds.Contains(x.id)).ToList();
        }

        [HttpPatch]
        [Route("me/boards/{boardId}/nodes/{nodeId}/")]
        public ActionResult<node> PatchNode([FromRoute] Int32 boardId, [FromRoute] Int16 nodeId, [FromBody] dynamic requestBody)
        {
            string authorization = Request.Headers["Authorization"];
            string token = authorization.Substring("Bearer ".Length).Trim();
            Int16 userId = _userService.GetUserId(token);

            node node = _context.node.FirstOrDefault(x => x.id == nodeId && x.owner_id == userId && x.board_id == boardId && x.deleted_at == null);

            if (node == null)
            {
                throw new MindMapException("嗚喔！ 分類已經被刪除，無法瀏覽", HttpStatusCode.NotFound);
            }
            if (requestBody.title != null)
            {
                node.title = requestBody.title;
            }
            if (requestBody.description != null)
            {
                node.description = requestBody.description;
            }
            if (requestBody.x != null)
            {
                node.x = requestBody.x;
            }
            if (requestBody.y != null)
            {
                node.y = requestBody.y;
            }
            _context.SaveChanges();
            return node;
        }

        [HttpDelete]
        [Route("me/boards/{boardId}/nodes/{nodeId}/")]
        public ActionResult<dynamic> DeleteNode([FromRoute] Int32 boardId, [FromRoute] Int16 nodeId)
        {
            string authorization = Request.Headers["Authorization"];
            string token = authorization.Substring("Bearer ".Length).Trim();

            Int16 userId = _userService.GetUserId(token);
            node node = _context.node.FirstOrDefault(x => x.id == nodeId && x.owner_id == userId && x.board_id == boardId && x.deleted_at == null);

            if (node is null)
            {
                throw new MindMapException("筆記已經找不到了 Q_Q", HttpStatusCode.NotFound);
            }
            else
            {
                node.deleted_at = DateTime.Now;
                Int32 deleteResult = _context.SaveChanges();
                if (deleteResult != 1)
                {
                    throw new MindMapException("筆記已經找不到了 Q_Q", HttpStatusCode.ExpectationFailed);
                }
            }
            JSONResponse result = new JSONResponse(JSONResponseStatus.OK, new { });
            return result.toResponseObj();
        }
    }
}