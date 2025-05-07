using AutoMapper;
using EmployeeManagmentAPI.DTOs;
using EmployeeManagmentAPI.Models;
using EmployeeManagmentAPI.Repositories.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeManagmentAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LeaveBalanceController : ControllerBase
    {
        private readonly ILeaveBalanceRepository _leaveBalanceRepository;
        private readonly IMapper _mapper;

        public LeaveBalanceController(ILeaveBalanceRepository leaveBalanceRepository, IMapper mapper)
        {
            _leaveBalanceRepository = leaveBalanceRepository;
            _mapper = mapper;
        }

        // GET: api/LeaveBalance/employee/5
        [HttpGet("employee/{employeeId}")]
        public async Task<ActionResult<IEnumerable<LeaveBalance>>> GetLeaveBalancesByEmployee(int employeeId)
        {
            var balances = await _leaveBalanceRepository.GetLeaveBalancesByEmployeeAsync(employeeId);
            return Ok(balances);
        }

        // GET: api/LeaveBalance/employee/5/leaveType/2
        [HttpGet("employee/{employeeId}/leaveType/{leaveMasterId}")]
        public async Task<ActionResult<LeaveBalanceDTO>> GetLeaveBalance(int employeeId, int leaveMasterId)
        {
            var balance = await _leaveBalanceRepository.GetLeaveBalanceAsync(employeeId, leaveMasterId);
            if (balance == null)
                return NotFound("Leave balance not found.");

            var dto = _mapper.Map<LeaveBalanceDTO>(balance);
            return Ok(dto);
        }


        // PUT: api/LeaveBalance
        [HttpPut]
        public async Task<IActionResult> UpdateLeaveBalance([FromBody] LeaveBalance leaveBalance)
        {
            await _leaveBalanceRepository.UpdateLeaveBalanceAsync(leaveBalance);
            return NoContent(); // 204
        }

        // POST: api/LeaveBalance
        [HttpPost]
        public async Task<ActionResult<LeaveBalance>> AddLeaveBalance([FromBody] LeaveBalance leaveBalance)
        {
            var created = await _leaveBalanceRepository.AddLeaveBalanceAsync(leaveBalance);
            return CreatedAtAction(nameof(GetLeaveBalance), new { employeeId = created.EmployeeId, leaveMasterId = created.LeaveMasterId }, created);
        }
    }
}
