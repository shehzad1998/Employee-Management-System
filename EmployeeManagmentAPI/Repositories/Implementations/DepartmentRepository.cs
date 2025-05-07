//using EmployeeManagmentAPI.Models;
//using EmployeeManagmentAPI.Repositories.Interfaces;
//using Microsoft.EntityFrameworkCore;

//namespace EmployeeManagmentAPI.Repositories.Implementations
//{
//    public class DepartmentRepository : IDepartmentRepository
//    {
//        private readonly EmployeeManagementDBContext _context;

//        public DepartmentRepository(EmployeeManagementDBContext context)
//        {
//            _context = context;
//        }

//        public async Task<IEnumerable<Department>> GetAllAsync()
//        {
//            return await _context.Departments.ToListAsync();
//        }

//        public async Task<Department> GetByIdAsync(int id)
//        {
//            return await _context.Departments.FindAsync(id);
//        }

//        public async Task<Department> AddAsync(Department department)
//        {
//            _context.Departments.Add(department);
//            await _context.SaveChangesAsync();
//            return department;
//        }

//        public async Task<Department> UpdateAsync(Department department)
//        {
//            _context.Departments.Update(department);
//            await _context.SaveChangesAsync();
//            return department;
//        }

//        public async Task<bool> DeleteAsync(int id)
//        {
//            var department = await _context.Departments.FindAsync(id);
//            if (department == null) return false;

//            _context.Departments.Remove(department);
//            await _context.SaveChangesAsync();
//            return true;
//        }
//    }
//}
