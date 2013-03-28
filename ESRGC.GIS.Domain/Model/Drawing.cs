using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.ComponentModel.DataAnnotations;

namespace ESRGC.GIS.Domain.Model
{
    public class Drawing
    {
        [ScaffoldColumn(false)]
        public int DrawingId { get; set; }
        public string FileName { get; set; }
        public int? FilePathId { get; set; }
        public virtual FilePath FilePath { get; set; }
        [Required]
        [Display(Name="Sheet No.")]
        public int? SheetNumber { get; set; }
        public bool AsBuilt { get; set; }
        public int? Book { get; set; }
        public string Page { get; set; }
        public bool Plan { get; set; }
        public bool Detail { get; set; }
        public bool CrossSection { get; set; }
        public bool Profile { get; set; }
        public bool Elevation { get; set; }
        public bool LocationOfValve { get; set; }
        public DateTime? DateLastRevised { get; set; }
        public DateTime? DateLastIndexed { get; set; }
        public int UserId { get; set; }
        public bool Rescan { get; set; }
        public double PaperWidth { get; set; }
        public double PaperHeight { get; set; }
    }
}
