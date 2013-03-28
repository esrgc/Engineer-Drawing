using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using PagedList;

namespace ESRGC.GIS.WebMap.Models
{
   
    public class MemberModel
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string LastLoginDate { get; set; }
        public string LastLoginTime { get; set; }
        public bool IsApproved { get; set; }
        public bool IsLocked { get; set; }
        public bool IsOnline { get; set; }
        public string[] Roles { get; set; }
    }
}