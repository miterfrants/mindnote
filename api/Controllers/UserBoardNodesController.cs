using System;
using System.Net;
using System.Linq;
using System.Collections.Generic;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

using Mindnote.Models;
using Mindnote.Services;

using Newtonsoft.Json.Linq;

namespace Mindnote.Controllers
{
    [Authorize]
    [Route("mindnote/api/v1/users/me/boards/{boardId}/nodes/")]
    [ApiController]
    public class UserBoardNodesController : ControllerBase
    {
        private readonly MindnoteContext _context;
        private readonly MindnoteContextForView _contextForView;
        private readonly UserService _userService;
        public UserBoardNodesController(MindnoteContext context, MindnoteContextForView contextForView, UserService userService)
        {
            _context = context;
            _contextForView = contextForView;
            _userService = userService;
        }

        [HttpGet]
        public ActionResult<List<view_node>> GetNodesInBoard([FromRoute] Int32 boardId)
        {
            string authorization = Request.Headers["Authorization"];
            string token = authorization.Substring("Bearer ".Length).Trim();
            Int16 userId = _userService.GetUserId(token);
            board board = _context.board.FirstOrDefault(x => x.id == boardId && x.owner_id == userId && x.deleted_at == null);

            if (board == null)
            {
                throw new MindnoteException("嗚喔！ 分類已經被刪除，無法瀏覽", HttpStatusCode.NotFound);
            }

            List<view_node> nodes = _contextForView.view_node.Where(x => x.board_id == board.id && x.deleted_at == null).ToList();
            return nodes;
        }


        [HttpPost]
        public ActionResult<view_node> PostNode([FromRoute] Int32 boardId, [FromBody] dynamic node)
        {
            string authorization = Request.Headers["Authorization"];
            string token = authorization.Substring("Bearer ".Length).Trim();

            Int16 userId = _userService.GetUserId(token);
            board board = _context.board.FirstOrDefault(x => x.id == boardId && x.owner_id == userId && x.deleted_at == null);

            if (board == null)
            {
                throw new MindnoteException("嗚喔！ 分類已經被刪除，無法瀏覽", HttpStatusCode.NotFound);
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
        public ActionResult<List<view_node>> PatchNodes([FromRoute] Int32 boardId, [FromBody] dynamic requestBody)
        {

            string authorization = Request.Headers["Authorization"];
            string token = authorization.Substring("Bearer ".Length).Trim();

            Int16 userId = _userService.GetUserId(token);
            board board = _context.board.FirstOrDefault(x => x.id == boardId && x.owner_id == userId && x.deleted_at == null);

            if (board == null)
            {
                throw new MindnoteException("嗚喔！ 分類已經被刪除，無法瀏覽", HttpStatusCode.NotFound);
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

        [HttpDelete]
        public ActionResult<int> DeleteNodes([FromRoute] Int32 boardId, [FromBody] dynamic requestBody)
        {
            string authorization = Request.Headers["Authorization"];
            string token = authorization.Substring("Bearer ".Length).Trim();
            Int16 userId = _userService.GetUserId(token);
            board board = _context.board.FirstOrDefault(x => x.id == boardId && x.owner_id == userId && x.deleted_at == null);
            if (board == null)
            {
                throw new MindnoteException("嗚喔！ 分類已經被刪除，無法瀏覽", HttpStatusCode.NotFound);
            }

            int[] nodeIds = requestBody.nodeIds.ToObject<int[]>();

            List<node> nodes = _context.node.Where(x => nodeIds.Contains(x.id) && x.board_id == board.id).ToList();
            foreach (node node in nodes)
            {
                node.deleted_at = DateTime.Now;
            }

            return _context.SaveChanges();
        }
    }
}