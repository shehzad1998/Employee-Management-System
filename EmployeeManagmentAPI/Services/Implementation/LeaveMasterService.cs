using AutoMapper;
using EmployeeManagmentAPI.DTOs;
using EmployeeManagmentAPI.Models;
using EmployeeManagmentAPI.Repositories.Interfaces;
using EmployeeManagmentAPI.Services.Interfaces;

namespace EmployeeManagmentAPI.Services.Implementation
{
    public class LeaveMasterService : ILeaveMasterService
    {
        private readonly ILeaveMasterRepository _repository;
        private readonly IMapper _mapper;

        public LeaveMasterService(ILeaveMasterRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<LeaveMasterDTO>> GetAllAsync()
        {
            var leaveMasters = await _repository.GetAllLeaveMastersAsync();
            return _mapper.Map<IEnumerable<LeaveMasterDTO>>(leaveMasters);
        }

        public async Task<LeaveMasterDTO?> GetByIdAsync(int id)
        {
            var leaveMaster = await _repository.GetLeaveMasterByIdAsync(id);
            return leaveMaster == null ? null : _mapper.Map<LeaveMasterDTO>(leaveMaster);
        }

        public async Task<LeaveMasterDTO> CreateAsync(LeaveMasterUpsertDTO dto)
        {
            var entity = _mapper.Map<LeaveMaster>(dto);
            var created = await _repository.AddLeaveMasterAsync(entity);
            return _mapper.Map<LeaveMasterDTO>(created);
        }

        public async Task<LeaveMasterDTO?> UpdateAsync(int id, LeaveMasterUpsertDTO dto)
        {
            var existing = await _repository.GetLeaveMasterByIdAsync(id);
            if (existing == null) return null;

            _mapper.Map(dto, existing);
            var updated = await _repository.UpdateLeaveMasterAsync(existing);
            return _mapper.Map<LeaveMasterDTO>(updated);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _repository.DeleteLeaveMasterAsync(id);
        }
    }
}
