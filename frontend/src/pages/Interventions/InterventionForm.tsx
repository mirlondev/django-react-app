import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Calendar,
  Clock,
  DollarSign,
  Truck,
  Drill,
  FileText,
  User,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api, { interventionsAPI, ticketsAPI, techniciansAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { Intervention, Technician, Ticket } from '../../types';
import { useNavigate, useParams } from 'react-router-dom';
import AuthenticatedLayout from '../../components/Auth/AuthenticatedLayout';
import LoadingSpinner from '../../components/Layout/LoadingSpinner';
import Button from '../../components/ui/Button';

// Validation schema
const interventionSchema = z.object({
  ticket: z.string().min(1, 'Ticket is required'),
  technician: z.string().min(1, 'Technician is required'),
  intervention_date: z.string().min(1, 'Date is required'),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  hours_worked: z.number().min(0, 'Hours worked must be a positive number'),
  travel_time: z.number().min(0, 'Travel time must be a positive number'),
  transport_cost: z.number().min(0, 'Transport cost must be a positive number'),
  additional_costs: z.number().min(0, 'Additional costs must be a positive number'),
  total_cost: z.number().min(0, 'Total cost must be a positive number'),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']),
  report: z.string().min(1, 'Report is required'),
  materials_used: z.string().optional(),
  equipment_used: z.string().optional(),
  technician_notes: z.string().optional(),
  customer_feedback: z.string().optional(),
  customer_rating: z.number().min(1).max(5).optional().nullable(),
});

type InterventionFormData = z.infer<typeof interventionSchema>;

interface InterventionFormProps {
  intervention?: Intervention;
  isEdit?: boolean;
}

const InterventionForm: React.FC<InterventionFormProps> = ({ intervention: propIntervention, isEdit = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [intervention, setIntervention] = useState<Intervention | null>(propIntervention || null);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit && id && !propIntervention);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<InterventionFormData>({
    resolver: zodResolver(interventionSchema),
    defaultValues: {
      ticket: '',
      technician: '',
      intervention_date: '',
      start_time: '',
      end_time: '',
      hours_worked: 0,
      travel_time: 0,
      transport_cost: 0,
      additional_costs: 0,
      total_cost: 0,
      status: 'scheduled',
      report: '',
      materials_used: '',
      equipment_used: '',
      technician_notes: '',
      customer_feedback: '',
      customer_rating: null,
    },
  });

  // Watch relevant fields for calculations
  const watchHoursWorked = watch('hours_worked');
  const watchTravelTime = watch('travel_time');
  const watchTransportCost = watch('transport_cost');
  const watchAdditionalCosts = watch('additional_costs');

  // Fetch intervention data when in edit mode
  useEffect(() => {
    const fetchIntervention = async () => {
      if (isEdit && id && !propIntervention) {
        setInitialLoading(true);
        try {
          const response = await interventionsAPI.getById(id);
          setIntervention(response.data);
        } catch (error) {
          toast.error('Failed to load intervention data');
          navigate('/interventions');
        } finally {
          setInitialLoading(false);
        }
      }
    };

    fetchIntervention();
  }, [isEdit, id, propIntervention, navigate]);

  // Populate form when intervention data is available
  useEffect(() => {
    if (intervention) {
      const formData = {
        ticket: intervention.ticket?.id || '',
        technician: intervention.technician?.id || '',
        intervention_date: intervention.intervention_date 
          ? new Date(intervention.intervention_date).toISOString().split('T')[0] 
          : '',
        start_time: intervention.start_time || '',
        end_time: intervention.end_time || '',
        hours_worked: intervention.hours_worked || 0,
        travel_time: intervention.travel_time || 0,
        transport_cost: intervention.transport_cost || 0,
        additional_costs: intervention.additional_costs || 0,
        total_cost: Number(intervention.total_cost) || 0,
        status: intervention.status || 'scheduled',
        report: intervention.report || '',
        materials_used: intervention.materials_used || '',
        equipment_used: intervention.equipment_used || '',
        technician_notes: intervention.technician_notes || '',
        customer_feedback: intervention.customer_feedback || '',
        customer_rating: intervention.customer_rating || null,
      };
      reset(formData);
    }
  }, [intervention, reset]);

  // Fetch tickets and technicians
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ticketsResponse, techniciansResponse] = await Promise.all([
          ticketsAPI.getAll(),
          techniciansAPI.getAll(),
        ]);
        
        setTickets(ticketsResponse.data);
        setTechnicians(techniciansResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load form data');
      }
    };

    fetchData();
  }, []);

 // Calculate total cost when relevant fields change
useEffect(() => {
  if (calculating) return;

  const hourlyRate = 50;

  // Force la conversion en nombre pour éviter NaN
  const hours = Number(watchHoursWorked) || 0;
  const travel = Number(watchTravelTime) || 0;
  const transport = Number(watchTransportCost) || 0;
  const additional = Number(watchAdditionalCosts) || 0;

  const laborCost = hours * hourlyRate;
  const total = laborCost + transport + additional;

  setValue('total_cost', Number(total.toFixed(2)));
}, [
  watchHoursWorked,
  watchTravelTime,
  watchTransportCost,
  watchAdditionalCosts,
  setValue
]);

// Calculate hours worked based on start and end time
const calculateHoursWorked = () => {
  const startTime = watch('start_time');
  const endTime = watch('end_time');

  if (startTime && endTime) {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);

    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours > 0) {
      setCalculating(true);
      setValue('hours_worked', Number(diffHours.toFixed(2)));
      setTimeout(() => setCalculating(false), 100);
    }
  }
};


  const onSubmit = async (data: InterventionFormData) => {
    setLoading(true);
    
    try {
      if (isEdit && id) {
        await interventionsAPI.update(id, data);
        toast.success('Intervention updated successfully');
      } else {
        await interventionsAPI.create(data);
        toast.success('Intervention created successfully');
      }
      
      navigate('/interventions');
    } catch (error: any) {
      toast.error('Failed to save intervention');
    } finally {
      setLoading(false);
    }
  };

  const onCancel = () => {
    navigate('/interventions');
  };

  // Show loading spinner while fetching intervention data
  if (initialLoading) {
    return (
      <AuthenticatedLayout>
        <LoadingSpinner/>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-black dark:text-white">
          {isEdit ? 'Edit Intervention' : 'Create New Intervention'}
        </h1>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {isEdit ? 'Update intervention details' : 'Add a new intervention to the system'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Ticket Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Ticket *
            </label>
            <select
              {...register('ticket')}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            >
              <option value="">Select a ticket</option>
              {tickets.map((ticket) => (
                <option key={ticket.id} value={ticket.id}>
                  {ticket.title} (ID: {ticket.id.substring(0, 8)})
                </option>
              ))}
            </select>
            {errors.ticket && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.ticket.message}
              </p>
            )}
          </div>

          {/* Technician Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Technician *
            </label>
            <select
              {...register('technician')}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            >
              <option value="">Select a technician</option>
              {technicians.map((technician) => (
                <option key={technician.id} value={technician.id}>
                  {technician.user.first_name} {technician.user.last_name}
                </option>
              ))}
            </select>
            {errors.technician && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.technician.message}
              </p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Intervention Date *
            </label>
            <div className="relative">
              <input
                type="date"
                {...register('intervention_date')}
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2.5 pl-10 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            </div>
            {errors.intervention_date && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.intervention_date.message}
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Status *
            </label>
            <select
              {...register('status')}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            >
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.status.message}
              </p>
            )}
          </div>

          {/* Time Fields */}
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Start Time
            </label>
            <div className="relative">
              <input
                type="time"
                {...register('start_time')}
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2.5 pl-10 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              End Time
            </label>
            <div className="relative">
              <input
                type="time"
                {...register('end_time')}
                onBlur={calculateHoursWorked}
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2.5 pl-10 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            </div>
          </div>

          {/* Hours Worked */}
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Hours Worked *
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              {...register('hours_worked', { valueAsNumber: true })}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
            {errors.hours_worked && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.hours_worked.message}
              </p>
            )}
          </div>

          {/* Travel Time */}
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Travel Time (hours) *
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              {...register('travel_time', { valueAsNumber: true })}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
            {errors.travel_time && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.travel_time.message}
              </p>
            )}
          </div>

          {/* Cost Fields */}
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Transport Cost ($) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('transport_cost', { valueAsNumber: true })}
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2.5 pl-10 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              />
              <Truck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            </div>
            {errors.transport_cost && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.transport_cost.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Additional Costs ($) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('additional_costs', { valueAsNumber: true })}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            />
            {errors.additional_costs && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.additional_costs.message}
              </p>
            )}
          </div>

          {/* Total Cost (calculated) */}
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Total Cost ($) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                {...register('total_cost', { valueAsNumber: true })}
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2.5 pl-10 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary font-semibold"
                readOnly
              />
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            </div>
            {errors.total_cost && (
              <p className="mt-1 text-sm text-red-500 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.total_cost.message}
              </p>
            )}
          </div>
        </div>

        {/* Report */}
        <div>
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            Report *
          </label>
          <div className="relative">
            <textarea
              rows={4}
              {...register('report')}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2.5 pl-10 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              placeholder="Detailed description of the intervention..."
            />
            <FileText className="absolute left-3 top-3 text-gray-500 w-4 h-4" />
          </div>
          {errors.report && (
            <p className="mt-1 text-sm text-red-500 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.report.message}
            </p>
          )}
        </div>

        {/* Materials and Equipment */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Materials Used
            </label>
            <div className="relative">
              <textarea
                rows={3}
                {...register('materials_used')}
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2.5 pl-10 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                placeholder="List materials used (format: name:quantity:cost)"
              />
              <Drill className="absolute left-3 top-3 text-gray-500 w-4 h-4" />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Format: Material Name:Quantity:Cost (one per line)
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Equipment Used
            </label>
            <textarea
              rows={3}
              {...register('equipment_used')}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              placeholder="List equipment used during the intervention..."
            />
          </div>
        </div>

        {/* Technician Notes and Customer Feedback */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Technician Notes
            </label>
            <textarea
              rows={3}
              {...register('technician_notes')}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              placeholder="Additional notes from the technician..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-black dark:text-white">
              Customer Feedback
            </label>
            <textarea
              rows={3}
              {...register('customer_feedback')}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              placeholder="Customer feedback about the service..."
            />
          </div>
        </div>

        {/* Customer Rating */}
        <div>
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            Customer Rating (1-5)
          </label>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setValue('customer_rating', rating)}
                className={`p-2 rounded-full ${
                  watch('customer_rating') === rating
                    ? 'bg-yellow-100 text-yellow-500 dark:bg-yellow-900/30'
                    : 'bg-gray-100 text-gray-400 dark:bg-gray-700'
                }`}
              >
                <span className="text-lg">★</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setValue('customer_rating', null)}
              className="p-2 text-gray-500 hover:text-red-500"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            onClick={onCancel}
            variant='secondary'
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            variant='primary'
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isEdit ? 'Update Intervention' : 'Create Intervention'}
          </Button>
        </div>
      </form>
    </div>
    </AuthenticatedLayout>
  );
};

export default InterventionForm;