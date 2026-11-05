const turnoService = require('../../src/services/turnoService');
const Turno = require('../../src/models/turnoModel');
const Paciente = require('../../src/models/pacienteModel');
const Profesional = require('../../src/models/profesionalModel');

// Mocks de Mongoose
jest.mock('../../src/models/turnoModel');
jest.mock('../../src/models/pacienteModel');
jest.mock('../../src/models/profesionalModel');

describe('Unit Tests: Servicio de Turnos (turnoService)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTurno()', () => {
    const turnoData = {
      paciente_id: 'pac_123',
      profesional_id: 'prof_456',
      especialidad: 'Cardiología',
      fecha_hora: '2026-11-20T10:00:00Z',
      motivo: 'Control anual'
    };

    test('Debe lanzar error 404 si el paciente no existe', async () => {
      Paciente.findById.mockResolvedValue(null);

      await expect(turnoService.createTurno(turnoData)).rejects.toMatchObject({
        message: expect.stringContaining('El paciente con ID pac_123 no existe'),
        statusCode: 404
      });

      expect(Paciente.findById).toHaveBeenCalledWith('pac_123');
      expect(Profesional.findById).not.toHaveBeenCalled();
    });

    test('Debe lanzar error 404 si el profesional no existe', async () => {
      Paciente.findById.mockResolvedValue({ _id: 'pac_123', nombre: 'Juan' });
      Profesional.findById.mockResolvedValue(null);

      await expect(turnoService.createTurno(turnoData)).rejects.toMatchObject({
        message: expect.stringContaining('El profesional con ID prof_456 no existe'),
        statusCode: 404
      });

      expect(Profesional.findById).toHaveBeenCalledWith('prof_456');
    });

    test('Debe lanzar error 409 si el profesional ya tiene un turno asignado en ese horario', async () => {
      Paciente.findById.mockResolvedValue({ _id: 'pac_123', nombre: 'Juan' });
      Profesional.findById.mockResolvedValue({ _id: 'prof_456', nombre: 'Carlos' });

      // Simular que ya hay un turno para ese médico y hora
      Turno.findOne.mockResolvedValue({ _id: 'turno_conflicto_789' });

      await expect(turnoService.createTurno(turnoData)).rejects.toMatchObject({
        message: 'El profesional ya tiene un turno reservado para esa fecha y hora',
        statusCode: 409
      });
    });

    test('Debe agendar exitosamente el turno con populate de paciente y profesional', async () => {
      Paciente.findById.mockResolvedValue({ _id: 'pac_123', nombre: 'Juan' });
      Profesional.findById.mockResolvedValue({ _id: 'prof_456', nombre: 'Carlos' });
      Turno.findOne.mockResolvedValue(null); // Sin conflicto de horario

      const mockTurnoInstance = {
        _id: 'turno_nuevo_111',
        save: jest.fn().mockResolvedValue(true)
      };

      Turno.mockImplementation(() => mockTurnoInstance);

      // Simular cadena de populate en findById
      const mockPopulatedTurno = {
        _id: 'turno_nuevo_111',
        especialidad: 'Cardiología',
        paciente_id: { nombre: 'Juan', apellido: 'Pérez' },
        profesional_id: { nombre: 'Carlos', apellido: 'Rodríguez' }
      };

      Turno.findById.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockPopulatedTurno)
        })
      });

      const resultado = await turnoService.createTurno(turnoData);

      expect(mockTurnoInstance.save).toHaveBeenCalled();
      expect(resultado).toEqual(mockPopulatedTurno);
    });
  });

  describe('deleteTurno()', () => {
    test('Debe lanzar error 404 si el turno a eliminar no existe', async () => {
      Turno.findByIdAndDelete.mockResolvedValue(null);

      await expect(turnoService.deleteTurno('turno_inexistente')).rejects.toMatchObject({
        message: 'Turno no encontrado',
        statusCode: 404
      });
    });

    test('Debe eliminar el turno correctamente si existe', async () => {
      const mockDeleted = { _id: 'turno_123', estado: 'CANCELADO' };
      Turno.findByIdAndDelete.mockResolvedValue(mockDeleted);

      const res = await turnoService.deleteTurno('turno_123');
      expect(res).toEqual(mockDeleted);
    });
  });
});
