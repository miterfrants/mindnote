using System.Security.Cryptography.X509Certificates;
using System;
using System.Net;
using System.Linq;
using System.Collections.Generic;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;


using Mindnote.Models;
using Mindnote.Services;
using Mindnote.Util;

namespace Mindnote.Controllers
{
    [Authorize]
    [Route("mindnote/api/v1/users/me/boards/{boardId}/relationship/")]
    [ApiController]
    public class UserBoardRelationshipsController : ControllerBase
    {
        private readonly MindnoteContext _context;
        private readonly MindnoteContextForView _contextForView;
        private readonly UserService _userService;
        public UserBoardRelationshipsController(MindnoteContext context, MindnoteContextForView contextForView, UserService userService)
        {
            _context = context;
            _contextForView = contextForView;
            _userService = userService;
        }

        [HttpGet]
        public ActionResult<List<view_node_relationship>> GetRelationshipInBoard([FromRoute] Int32 boardId)
        {
            string authorization = Request.Headers["Authorization"];
            string token = authorization.Substring("Bearer ".Length).Trim();
            Int16 userId = _userService.GetUserId(token);
            board board = _context.board.FirstOrDefault(x => x.id == boardId && x.owner_id == userId && x.deleted_at == null);

            if (board == null)
            {
                throw new MindnoteException("嗚喔！ 分類已經被刪除，無法瀏覽", HttpStatusCode.NotFound);
            }

            return _contextForView.view_node_relationship.Where(x => x.board_id == board.id).ToList();
        }

        [HttpDelete]
        public ActionResult<int> DeleteRelationshipInBoard([FromRoute] Int32 boardId, [FromBody] dynamic requestBody)
        {
            string authorization = Request.Headers["Authorization"];
            string token = authorization.Substring("Bearer ".Length).Trim();
            Int16 userId = _userService.GetUserId(token);
            board board = _context.board.FirstOrDefault(x => x.id == boardId && x.owner_id == userId && x.deleted_at == null);

            if (board == null)
            {
                throw new MindnoteException("嗚喔！ 分類已經被刪除，無法瀏覽", HttpStatusCode.NotFound);
            }

            int[] relationshipIds = requestBody.relationshipIds.ToObject<int[]>();

            List<node_relationship> relationships = _context.node_relationship.Where(x => relationshipIds.Contains(x.id) && x.deleted_at == null).ToList();
            foreach (node_relationship relationship in relationships)
            {
                relationship.deleted_at = DateTime.Now;
            }
            return _context.SaveChanges();
        }

        [HttpPost]
        public ActionResult<node_relationship> PostRelationshipInBoard([FromRoute] Int32 boardId, [FromBody] dynamic body)
        {
            string authorization = Request.Headers["Authorization"];
            string token = authorization.Substring("Bearer ".Length).Trim();
            Int16 userId = _userService.GetUserId(token);
            board board = _context.board.FirstOrDefault(x => x.id == boardId && x.owner_id == userId && x.deleted_at == null);

            if (board == null)
            {
                throw new MindnoteException("嗚喔！ 分類已經被刪除，無法瀏覽", HttpStatusCode.NotFound);
            }
            int parentNodeId = (int)body.parent_node_id;
            int childNodeId = (int)body.child_node_id;
            bool isExists = _context.node_relationship.Where(x => ((x.parent_node_id == parentNodeId && x.child_node_id == childNodeId) || (x.parent_node_id == childNodeId && x.child_node_id == parentNodeId)) && x.deleted_at == null).Count() >= 1;

            if (isExists)
            {
                throw new MindnoteException("關聯建立失敗，不能重複建立連線", HttpStatusCode.ExpectationFailed);
            }

            node_relationship nodeRelationship = new node_relationship { parent_node_id = body.parent_node_id, child_node_id = body.child_node_id };
            _context.node_relationship.Add(nodeRelationship);
            _context.SaveChanges();
            return nodeRelationship;
        }
    }
}