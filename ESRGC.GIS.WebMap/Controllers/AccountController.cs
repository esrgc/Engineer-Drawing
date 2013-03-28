using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using ESRGC.GIS.WebMap.Models;
using PagedList;
using ESRGC.GIS.Domain.WorkUnits.Abstract;

namespace ESRGC.GIS.WebMap.Controllers
{
    public class AccountController : BaseController
    {
        public AccountController(ISalisburyCityWorkUnit workUnit): base(workUnit) {
            
        }
        /// <summary>
        /// Member manager
        /// </summary>
        /// <param name="searchString"></param>
        /// <param name="currentFilter"></param>
        /// <param name="page"></param>
        /// <returns></returns>
        [Authorize(Roles = "admin")]
        public ActionResult Index(string searchString, string currentFilter, int? page) {
            if (Request.HttpMethod == "GET") {
                searchString = currentFilter;
            }
            else {
                page = 1;
            }
            ViewBag.CurrentFilter = searchString;

            IEnumerable<MembershipUser> members = getMembers();
            if (!string.IsNullOrEmpty(searchString))
                members = members.Where(x => x.UserName.ToUpper().Contains(searchString.ToUpper()));

            //get users
            var users = members.Select(x => new MemberModel() {
                Username = x.UserName,
                Email = x.Email,
                IsApproved = x.IsApproved,
                IsLocked = x.IsLockedOut,
                IsOnline = x.IsOnline,
                LastLoginDate = x.LastLoginDate.ToShortDateString(),
                LastLoginTime = x.LastLoginDate.ToShortTimeString(),
                Roles = Roles.GetRolesForUser(x.UserName)
            }).ToList();

            int pageIndex = (page ?? 1);

            var membershipModelObject = new PagedListCollection<MemberModel>() {
                Collection = users.ToPagedList(pageIndex, 10)
            };

            return View(membershipModelObject);
        }


        [Authorize(Roles = "admin")]
        public ActionResult AssignAdmin(string username, string command) {
            if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(command)) {
                TempData["message"] = "Username or action wasn't found";
                return RedirectToAction("Index");
            }
            try {
                switch (command) {
                    case "assign":
                        if (Roles.RoleExists("admin")) {
                            Roles.AddUserToRole(username, "admin");
                            TempData["message"] = "Username " + username + " has been assigned with admin role";
                        }
                        else
                            throw new InvalidOperationException("Admin role doesn't exist");
                        break;

                    case "remove":
                        if (Roles.RoleExists("admin") && User.Identity.Name != username) {
                            Roles.RemoveUserFromRole(username, "admin");
                            TempData["message"] = "Username " + username + " has been removed from admin role";
                        }
                        else
                            throw new InvalidOperationException("Admin role doesn't exist or you can not remove your own account from admin role");
                        break;
                }
            }
            catch (Exception ex) {
                TempData["message"] = ex.Message;
            }
            return RedirectToAction("Index");
        }
        /// <summary>
        /// Edit user information
        /// </summary>
        /// <param name="username"></param>
        /// <returns></returns>
        [Authorize(Roles = "admin")]
        public ActionResult Edit(string username) {
            var users = getMembers();
            var user = users.First(x => x.UserName.ToUpper() == username.ToUpper());
            var userData = new MemberModel() {
                Username = user.UserName,
                Email = user.Email,
                IsApproved = user.IsApproved,
                IsLocked = user.IsLockedOut,
                IsOnline = user.IsOnline,
                LastLoginDate = user.LastLoginDate.ToShortDateString(),
                LastLoginTime = user.LastLoginDate.ToShortTimeString(),
                Roles = Roles.GetRolesForUser(user.UserName)
            };
            return View(userData);
        }
        [HttpPost]
        public ActionResult Edit(MemberModel user) {
            var member = Membership.GetUser(user.Username);
            if (ModelState.IsValid) {
                member.Email = user.Email;
                //unlock 
                if (member.IsLockedOut && !user.IsLocked)
                    member.UnlockUser();
                //approve or disapprove
                member.IsApproved = user.IsApproved;
                updateTempDataMessage("User data updated!", null);
                Membership.UpdateUser(member);
                return RedirectToAction("Index");
            }
            //something wrong
            return View(user);
        }
        /// <summary>
        /// delete a user
        /// </summary>
        /// <param name="username">username to be deleted</param>
        /// <param name="confirmed">confirm delete</param>
        /// <returns>views</returns>
        [Authorize(Roles = "admin")]
        public ActionResult Delete(string username, bool confirmed) {
            if (username == "administrator" || username == "admin") {
                updateTempDataMessage("You can not delete administrator account", "warning");
                return RedirectToAction("Index");
            }
            if (User.Identity.Name == username) {
                updateTempDataMessage("You can not delete your own user account", "warning");
                return RedirectToAction("Index");
            }
            if (confirmed) {
                Membership.DeleteUser(username);
                updateTempDataMessage("User " + username + " has been deleted!", "success");
                return RedirectToAction("Index");
            }
            else {
                ViewBag.Username = username;
                return View();
            }
        }
        [Authorize(Roles = "admin")]
        public ActionResult ChangeUserStatus(string username, string command) {
            var user = Membership.GetUser("username");
            if (user == null) {
                TempData["message"] = "User " + username + " could not be found.";
                return RedirectToAction("Index");
            }
            switch (command) {
                case "unlock":
                    user.UnlockUser();
                    TempData["message"] = "User " + username + " has been unlocked";
                    break;
            }
            return RedirectToAction("index");
        }
        [Authorize(Roles = "admin")]
        public RedirectToRouteResult ApproveUser(string username) {
            var user = Membership.GetUser(username);
            if (!user.IsApproved) {
                user.IsApproved = true;
                Membership.UpdateUser(user);
            }
            updateTempDataMessage("User " + username + " has been approved", "info");
            return RedirectToAction("Index");
        }

        //
        // GET: /Account/LogOn

        public ActionResult LogOn() {
            return PartialView();
        }

        //
        // POST: /Account/LogOn
        /// <summary>
        /// Ajax log-in 
        /// </summary>
        /// <param name="model">log in info</param>
        /// <returns></returns>
        [HttpPost]
        public ActionResult LogOn(LogOnModel model) {
            if (ModelState.IsValid) {
                if (Membership.ValidateUser(model.UserName, model.Password)) {
                    FormsAuthentication.SetAuthCookie(model.UserName, false);//always non-persistent mode
                    var user = Membership.GetUser(model.UserName);

                    Session["currentUser"] = user;
                    updateTempDataMessage("You have successfully signed in.", "success");
                }
                else {
                    ModelState.AddModelError("", "Error signing in. Username or password is invalid.");
                }
            }
            // return view
            return PartialView();
        }

        //
        // GET: /Account/LogOff

        public ActionResult LogOff(string mode) {
            FormsAuthentication.SignOut();
            Session["currentUser"] = null;

            mode = mode ?? "ajax";

            if (mode == "ajax") {
                updateTempDataMessage("You have successfully signed out. Please use the form below to sign in again", "success");
                return RedirectToAction("LogOn");
            }
            else {
                updateTempDataMessage("You have successfully signed out.", "success");
                return View();
            }
        }

        //
        // GET: /Account/Register
        [Authorize(Roles = "admin")]
        public ActionResult Create() {
            return View();
        }

        //
        // POST: /Account/Register

        [HttpPost]
        [Authorize(Roles = "admin")]
        public ActionResult Create(RegisterModel model) {
            if (ModelState.IsValid) {
                // Attempt to register the user
                MembershipCreateStatus createStatus;
                Membership.CreateUser(model.UserName, model.Password,
                    model.Email, null, null, false, null, out createStatus);

                if (createStatus == MembershipCreateStatus.Success) {
                    if (Roles.RoleExists("user")) {
                        Roles.AddUserToRole(model.UserName, "user");
                    }
                    return RedirectToAction("Index");
                }
                else {
                    ModelState.AddModelError("", ErrorCodeToString(createStatus));
                }
            }

            // If we got this far, something failed, redisplay form
            return View(model);
        }

        //
        // GET: /Account/ChangePassword

        [Authorize]
        public ActionResult ChangePassword() {
            return View();
        }

        //
        // POST: /Account/ChangePassword

        [Authorize]
        [HttpPost]
        public ActionResult ChangePassword(ChangePasswordModel model) {
            if (ModelState.IsValid) {

                // ChangePassword will throw an exception rather
                // than return false in certain failure scenarios.
                bool changePasswordSucceeded;
                try {
                    MembershipUser currentUser = Membership.GetUser(User.Identity.Name, true /* userIsOnline */);
                    changePasswordSucceeded = currentUser.ChangePassword(model.OldPassword, model.NewPassword);
                }
                catch (Exception) {
                    changePasswordSucceeded = false;
                }

                if (changePasswordSucceeded) {
                    return RedirectToAction("ChangePasswordSuccess");
                }
                else {
                    ModelState.AddModelError("", "The current password is incorrect or the new password is invalid.");
                }
            }

            // If we got this far, something failed, redisplay form
            return View(model);
        }

        //
        // GET: /Account/ChangePasswordSuccess

        public ActionResult ChangePasswordSuccess() {
            return View();
        }

        public ActionResult AccountDetail(int id) {
            return View();
        }

        #region Status Codes
        private static string ErrorCodeToString(MembershipCreateStatus createStatus) {
            // See http://go.microsoft.com/fwlink/?LinkID=177550 for
            // a full list of status codes.
            switch (createStatus) {
                case MembershipCreateStatus.DuplicateUserName:
                    return "User name already exists. Please enter a different user name.";

                case MembershipCreateStatus.DuplicateEmail:
                    return "A user name for that e-mail address already exists. Please enter a different e-mail address.";

                case MembershipCreateStatus.InvalidPassword:
                    return "The password provided is invalid. Please enter a valid password value.";

                case MembershipCreateStatus.InvalidEmail:
                    return "The e-mail address provided is invalid. Please check the value and try again.";

                case MembershipCreateStatus.InvalidAnswer:
                    return "The password retrieval answer provided is invalid. Please check the value and try again.";

                case MembershipCreateStatus.InvalidQuestion:
                    return "The password retrieval question provided is invalid. Please check the value and try again.";

                case MembershipCreateStatus.InvalidUserName:
                    return "The user name provided is invalid. Please check the value and try again.";

                case MembershipCreateStatus.ProviderError:
                    return "The authentication provider returned an error. Please verify your entry and try again. If the problem persists, please contact your system administrator.";

                case MembershipCreateStatus.UserRejected:
                    return "The user creation request has been canceled. Please verify your entry and try again. If the problem persists, please contact your system administrator.";

                default:
                    return "An unknown error occurred. Please verify your entry and try again. If the problem persists, please contact your system administrator.";
            }
        }
        #endregion

        #region privates
        private static IEnumerable<MembershipUser> getMembers() {
            var memberList = Membership.GetAllUsers();//get all users

            IEnumerable<MembershipUser> members = memberList.Cast<MembershipUser>();//cast to enumerable collection
            return members;
        }
        #endregion
    }
}
