const pacienteService = require('../../src/services/pacienteService');
const Paciente = require('../../src/models/pacienteModel');

jest.mock('../../src/models/pacienteModel');

describe('Unit Tests: Servicio de Pacientes (pacienteService)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createPaciente()', () => {
    const pacienteData = {
      nombre: 'Ana',
      apellido: 'López',
      dni: '38123456',
      fecha_nacimiento: '1995-04-12T00:00:00Z',
      contacto: { email: 'ana@email.com' }
    };

    test('Debe lanzar error 400 si ya existe un paciente con el mismo DNI', async () => {
      Paciente.findOne.mockResolvedValue({ _id: 'pac_existente', dni: '38123456' });

      await expect(pacienteService.createPaciente(pacienteData)).rejects.toMatchObject({
        message: expect.stringContaining('Ya existe un paciente registrado con el DNI'),
        statusCode: 400
      });

      expect(Paciente.findOne).toHaveBeenCalledWith({ dni: '38123456' });
    });

    test('Debe registrar exitosamente un paciente si el DNI es nuevo', async () => {
      Paciente.findOne.mockResolvedValue(null);

      const mockSaved = {
        _id: 'pac_nuevo_999',
        ...pacienteData
      };
      mockSaved.save = jest.fn().mockResolvedValue(mockSaved);

      Paciente.mockImplementation(() => mockSaved);

      const resultado = await pacienteService.createPaciente(pacienteData);

      expect(mockSaved.save).toHaveBeenCalled();
      expect(resultado._id).toBe('pac_nuevo_999');
      expect(resultado.nombre).toBe('Ana');
    });
  });

  describe('getPacienteById()', () => {
    test('Debe lanzar error 404 si el paciente no existe', async () => {
      Paciente.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await expect(pacienteService.getPacienteById('id_falso')).rejects.toMatchObject({
        message: 'Paciente no encontrado',
        statusCode: 404
      });
    });

    test('Debe retornar los datos del paciente con historia clínica', async () => {
      const mockPaciente = {
        _id: 'pac_1',
        nombre: 'Juan',
        historia_clinica: { antecedentes: ['Asma'] }
      };

      Paciente.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockPaciente)
      });

      const resultado = await pacienteService.getPacienteById('pac_1');
      expect(resultado).toEqual(mockPaciente);
    });
  });

  describe('deletePaciente()', () => {
    test('Debe lanzar error 404 si el paciente a eliminar no existe', async () => {
      Paciente.findByIdAndDelete.mockResolvedValue(null);

      await expect(pacienteService.deletePaciente('id_inexistente')).rejects.toMatchObject({
        message: 'Paciente no encontrado',
        statusCode: 404
      });
    });

    test('Debe eliminar el paciente si existe', async () => {
      const mockDeleted = { _id: 'pac_123', nombre: 'Eliminado' };
      Paciente.findByIdAndDelete.mockResolvedValue(mockDeleted);

      const resultado = await pacienteService.deletePaciente('pac_123');
      expect(resultado).toEqual(mockDeleted);
    });
  });
});
