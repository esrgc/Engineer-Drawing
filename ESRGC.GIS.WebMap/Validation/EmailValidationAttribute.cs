using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;
using System.Net.Mail;

namespace ESRGC.GIS.WebMap.Validation
{
    public class EmailValidationAttribute: ValidationAttribute
    {
        public EmailValidationAttribute() {
            //Default error message unless declared on the attribute
            ErrorMessage = "{0} must be a valid email address";
        }

        public override bool IsValid(object value) {
            var emailString = value as string;
            if (string.IsNullOrEmpty(emailString))
                return false;
            try {
                var address = new MailAddress(emailString).Address;
            }
            catch (FormatException) {
                //email is invalid
                return false;
            }

            return true;
        }
    }
}