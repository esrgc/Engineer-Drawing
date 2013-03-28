using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.ComponentModel.DataAnnotations;

namespace ESRGC.GIS.Domain.Model
{
    public class FilePath
    {
        [Required]
        public int FilePathId { get; set; }
        [MaxLength(255)]
        public string Path { get; set; }
    }
}
