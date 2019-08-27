using System.Net;
using System.Collections.Generic;
using System;
using System.Linq;
using Microsoft.AspNetCore.Mvc;

using Mindnote.Models;
using Mindnote.Services;
using Mindnote.Constants;

namespace Mindnote.Controllers
{
    [Route("mindnote/api/v1/nodes/")]
    [ApiController]
    public class NodeController : ControllerBase
    {
        private readonly MindnoteContext _context;
        private readonly MindnoteContextForView _contextForView;
        public NodeController(MindnoteContext context, MindnoteContextForView contextForView, UserService userService)
        {
            _context = context;
            _contextForView = contextForView;
        }


        [HttpGet]
        [Route("sitemap/")]
        public ActionResult<List<dynamic>> GetAllForSiteMap()
        {
            return _contextForView.view_node.Where(x => x.board_is_public == true && x.deleted_at == null)
                .OrderByDescending(x => x.created_at)
                .Select(node => new
                {
                    latest_updated_at = node.updated_at,
                    board_id = node.board_id,
                    id = node.id
                })
                .ToList<dynamic>();
        }
    }
}