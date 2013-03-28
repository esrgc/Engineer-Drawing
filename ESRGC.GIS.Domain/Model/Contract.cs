using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.ComponentModel.DataAnnotations;

namespace ESRGC.GIS.Domain.Model
{
    public class Contract
    {
        [ScaffoldColumn(false)]
        public int ContractId { get; set; }
        [MaxLength(50)]
        [Display(Name="Contract No.")]
        [Required]
        public string ContractNum { get; set; }
        [MaxLength(100)]
        [Display(Name="Contract Company")]
        public string ContractCompany { get; set; }
        [MaxLength(100)]
        [Display(Name="Company Name")]
        public string CompanyName { get; set; }
        [Display(Name = "Storm water")]
        public bool StormWater { get; set; }
        public bool Sanitary { get; set; }
        public bool Water { get; set; }
        public int? Status { get; set; }
    }
}
