using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace EmployeeManagmentAPI.Models;

public partial class Employee
{
    public int Id { get; set; }

    public string Name { get; set; }

    public string Phone { get; set; }

    public int DepartmentId { get; set; }

    public int DesignationId { get; set; }
    public int? ManagerId { get; set; }
    public virtual Employee? Manager { get; set; }
    public virtual ICollection<Employee> Subordinates { get; set; } = new List<Employee>();

    public int UserId { get; set; } 

    public virtual Department Department { get; set; }

    public virtual Designation Designation { get; set; }

    public virtual ICollection<Leave> Leaves { get; set; } = new List<Leave>();

    public virtual User User { get; set; }


}
