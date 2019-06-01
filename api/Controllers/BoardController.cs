using System.Net;
using System.Collections.Generic;
using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Mindmap.Models;
using Mindmap.Services;
using Mindmap.Constants;

namespace Mindmap.Controllers
{
    [Route("mindmap/api/v1/boards/")]
    [ApiController]
    public class BoardController : ControllerBase
    {
        private readonly MindmapContext _context;
        private readonly MindmapContextForView _contextForView;
        public BoardController(MindmapContext context, MindmapContextForView contextForView, UserService userService)
        {
            _context = context;
            _contextForView = contextForView;
        }


        [HttpGet]
        public ActionResult<List<board>> GetAll()
        {
            return _context.board.Where(x=> x.is_public == true && x.deleted_at == null).OrderByDescending(x => x.created_at).Take(20).ToList();
        }

        [HttpGet]
        [Route("{boardUniqueName}/")]
        public ActionResult<board> Get([FromRoute] string boardUniqueName)
        {
            board result = _context.board.FirstOrDefault(x => 
                x.uniquename.Equals(boardUniqueName));
            if(result == null) {
                HttpContext.Response.StatusCode = HttpStatusCode.NotFound.GetHashCode();
                return null;
            } else if (!result.is_public) { 
                HttpContext.Response.StatusCode = HttpStatusCode.Unauthorized.GetHashCode();
                return null;
            } else {
                return result;
            }
        }

        [HttpGet]
        [Route("{boardUniqueName}/nodes/")]
        public ActionResult<List<ViewRelatedNode>> GetNodes([FromRoute] string boardUniqueName)
        {
            board board = _context.board.FirstOrDefault(x => 
                x.uniquename.Equals(boardUniqueName));
            if(board == null) {
                HttpContext.Response.StatusCode = HttpStatusCode.NotFound.GetHashCode();
                return null;
            } else if (!board.is_public) { 
                HttpContext.Response.StatusCode = HttpStatusCode.Unauthorized.GetHashCode();
                return null;
            } else {
                return _contextForView.ViewRelatedNode.Where(x => x.board_id == board.id).ToList();
            }
        }

    }
}