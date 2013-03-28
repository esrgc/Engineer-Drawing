using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Collections;

namespace ESRGC.GIS.Domain.Helpers
{
    public class HelperClass
    {
        /// <summary>
        /// parses address from input string and eliminates the dots.
        /// </summary>
        /// <param name="address">address to be parsed</param>
        /// <returns>address without dots form</returns>
        public static string parseAddressFromInput(string address)
        {

            if (string.IsNullOrEmpty(address))
                throw new Exception("Address can not be null or empty");
            address = address.Replace(".", " ").ToUpper();
            address = address.Replace("  ", " ");
            address = address.TrimEnd(new char[] { ' ' });
            return address;
        }

        /// <summary>
        /// constructs select statement parameters
        /// </summary>
        /// <param name="attributes">attribute string array</param>
        /// <returns>attribute string for query</returns>
        public static string buildAttributeString(string[] attributes)
        {
            string attributeString = string.Empty;
            for (int i = 0; i < attributes.Count(); i++)
            {
                attributeString += string.Format(", {0}", attributes[i]);
            }
            return attributeString;
        }
        /// <summary>
        /// constructs select statement parameters with table prefix
        /// Note that this function can not be used when query contains aggregated funtion. 
        /// e.i. [table].CDATE([Column]) will fail
        /// </summary>
        /// <param name="attributes">Attribute array to be construct</param>
        /// <param name="prefix">Table prefix used in query. I.e. [A].Name</param>
        /// <returns>attribute string for query</returns>
        public static string buildAttributeString(string[] attributes, string prefix)
        {
            string attributeString = string.Empty;
            for (int i = 0; i < attributes.Count(); i++)
            {
                attributeString += string.Format(",{0}.{1}", prefix, attributes[i]);
            }
            return attributeString;
        }
        /// <summary>
        /// constructs select statement parameters with alias
        /// </summary>
        /// <param name="attributes">Hashtable (Dictionary) type collection of the attributes to be constructed into attribute string</param>
        /// <returns>attribute string for query</returns>
        public static string buildAttributeString(IDictionary attributes)
        {
            string attributeString = string.Empty;
            foreach (var key in attributes.Keys)
            {
                attributeString += string.Format(", {0} as {1}", key, attributes[key]);
            }
            return attributeString;
        }

        /// <summary>
        /// Constructs select statement parameters with aliases and table prefix
        /// Each key is the column name, and value is the alias.
        /// Note that this function can not be used when query contains aggregated funtion. 
        /// e.i. [table].CDATE([Column]) will fail
        /// </summary>
        /// <param name="attributes">Hashtable (Dictionary) type collection of the attributes to be constructed into attribute string</param>
        /// <param name="prefix">Table prefix used in query. I.e. [A].Name</param>
        /// <returns>attribute string for query</returns>
        public static string buildAttributeString(IDictionary attributes, string prefix)
        {
            string attributeString = string.Empty;
            foreach (var key in attributes.Keys)
            {
                attributeString += string.Format(", {0}.{1} as {2}", prefix, key, attributes[key]);
            }
            return attributeString;
        }
    }
}
