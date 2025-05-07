using System.ComponentModel.DataAnnotations.Schema;

namespace EmployeeManagmentAPI.Models
{
    [Table("LeaveBalance")]
    public class LeaveBalance
    {
        public int Id { get; set; }

        public int EmployeeId { get; set; }
        public Employee? Employee { get; set; }

        public int LeaveMasterId { get; set; }
        public LeaveMaster LeaveMaster { get; set; }

        public int TotalDays { get; set; }

        public int UsedDays { get; set; }
        
        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public int RemainingDays { get; private set; }
    }
}
