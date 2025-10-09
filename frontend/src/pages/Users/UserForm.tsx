import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Mail,
  Shield,
  UserCog,
  UserCheck,
  Save,
  X,
  Upload,
  Trash2,
  Camera
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api, { usersAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import AuthenticatedLayout from '../../components/Auth/AuthenticatedLayout';
import Button from '../../components/ui/Button';

// Validation schema - Updated to handle edit mode properly
const userSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  userType: z.enum(['admin', 'technician', 'client']),
  password: z.string().optional().refine((val) => {
    // For new users, password is required
    // For edit mode, password is optional
    return true;
  }),
  confirmPassword: z.string().optional(),
  profile_image: z.any().optional(),
}).refine((data) => {
  // Only validate password matching if password is provided
  if (data.password && data.password.length > 0) {
    if (data.password.length < 6) {
      return false;
    }
    if (data.password !== data.confirmPassword) {
      return false;
    }
  }
  return true;
}, {
  message: "Password must be at least 6 characters and passwords must match",
  path: ["confirmPassword"],
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  user?: any;
  isEdit?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ user: propUser, isEdit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [loading, setLoading] = useState(false);
  const [fetchingUser, setFetchingUser] = useState(isEdit);
  const [user, setUser] = useState(propUser);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: '',
      first_name: '',
      last_name: '',
      email: '',
      userType: 'client',
      password: '',
      confirmPassword: '',
    },
  });

  // Fetch user data when in edit mode
  useEffect(() => {
    const fetchUserData = async () => {
      if (isEdit && id && !propUser) {
        try {
          setFetchingUser(true);
          const response = await usersAPI.getById(id);
          const userData = response.data || response; // Handle different API response structures
          setUser(userData);
          console.log('Fetched user data:', userData);
        } catch (error) {
          console.error('Error fetching user:', error);
          toast.error('Failed to fetch user data');
          navigate('/admin/users');
        } finally {
          setFetchingUser(false);
        }
      } else if (propUser) {
        setUser(propUser);
        setFetchingUser(false);
      } else {
        setFetchingUser(false);
      }
    };

    fetchUserData();
  }, [isEdit, id, propUser, navigate]);

  // Reset form when user data is available
  useEffect(() => {
    if (user && !fetchingUser) {
      console.log('Populating form with user data:', user);
      reset({
        username: user.username || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        userType: user.userType || user.user_type || 'client', // Handle different field names
        password: '',
        confirmPassword: '',
      });
      
      // Set image preview if user has a profile image
      if (user.profile_image) {
        setImagePreview(user.profile_image);
      }
    }
  }, [user, fetchingUser, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingImage(true);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
      
      // Set value for form
      setValue('profile_image', file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setValue('profile_image', null);
  };

  const onSubmit = async (data: UserFormData) => {
    setLoading(true);
    
    try {
      const formData = new FormData();
      
      // Append all fields to formData
      Object.keys(data).forEach(key => {
        if (key === 'profile_image' && data[key]) {
          formData.append(key, data[key]);
        } else if (key === 'confirmPassword') {
          // Skip confirmPassword field
          return;
        } else if (key === 'password') {
          // Only include password if it's provided and not empty
          if (data[key] && data[key].length > 0) {
            formData.append(key, data[key] as string);
          }
        } else if (data[key as keyof UserFormData]) {
          formData.append(key, data[key as keyof UserFormData] as string);
        }
      });

      let result;
      if (isEdit && id) {
        result = await usersAPI.update(id, formData);
        toast.success('User updated successfully');
      } else {
        // For new users, password is required
        if (!data.password || data.password.length === 0) {
          toast.error('Password is required for new users');
          return;
        }
        result = await usersAPI.create(formData);
        toast.success('User created successfully');
      }
      
      console.log('API Response:', result); // Debug log
      navigate('/admin/users');
    } catch (error: any) {
      console.error('Error saving user:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Failed to save user';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const onCancel = () => {
    navigate('/admin/users');
  };

  const getUserTypeIcon = (userType: string) => {
    switch (userType) {
      case 'admin':
        return <Shield className="w-5 h-5 text-purple-500" />;
      case 'technician':
        return <UserCog className="w-5 h-5 text-blue-500" />;
      case 'client':
        return <UserCheck className="w-5 h-5 text-green-500" />;
      default:
        return <User className="w-5 h-5 text-gray-500" />;
    }
  };

  // Debug: Log current form values
  const watchedValues = watch();
  console.log('Current form values:', watchedValues);
  console.log('User data:', user);
  console.log('IsEdit:', isEdit);
  console.log('Fetching user:', fetchingUser);

  // Show loading spinner while fetching user data
  if (fetchingUser) {
    return (
      <AuthenticatedLayout>
        <div className="mx-auto max-w-2xl p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600 dark:text-gray-400">Loading user data...</span>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="mx-auto max-w-2xl p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-black dark:text-white">
            {isEdit ? 'Edit User' : 'Create New User'}
          </h1>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {isEdit ? 'Update user information' : 'Add a new user to the system'}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Image Upload */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 text-gray-400" />
                )}
              </div>
              
              <label
                htmlFor="profile-image"
                className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors"
              >
                {uploadingImage ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Camera className="w-4 h-4" />
                )}
                <input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
              
              {imagePreview && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Username */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Username *
              </label>
              <div className="relative">
                <input
                  type="text"
                  {...register('username')}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2.5 pl-10 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  placeholder="Enter username"
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* First Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                First Name *
              </label>
              <input
                type="text"
                {...register('first_name')}
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                placeholder="Enter first name"
              />
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.first_name.message}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Last Name *
              </label>
              <input
                type="text"
                {...register('last_name')}
                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                placeholder="Enter last name"
              />
              {errors.last_name && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.last_name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                Email *
              </label>
              <div className="relative">
                <input
                  type="email"
                  {...register('email')}
                  className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2.5 pl-10 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  placeholder="Enter email address"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* User Type */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                User Type *
              </label>
              <Controller
                name="userType"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    {[
                      { value: 'admin', label: 'Admin', icon: <Shield className="w-5 h-5" /> },
                      { value: 'technician', label: 'Technician', icon: <UserCog className="w-5 h-5" /> },
                      { value: 'client', label: 'Client', icon: <UserCheck className="w-5 h-5" /> },
                    ].map((type) => (
                      <label
                        key={type.value}
                        className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 p-4 text-center transition-colors ${
                          field.value === type.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          {...field}
                          value={type.value}
                          checked={field.value === type.value}
                          onChange={() => field.onChange(type.value)}
                          className="hidden"
                        />
                        {type.icon}
                        {type.label}
                      </label>
                    ))}
                  </div>
                )}
              />
              {errors.userType && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.userType.message}
                </p>
              )}
            </div>

            {/* Password (only for new users) */}
            {!isEdit && (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                    Password *
                  </label>
                  <input
                    type="password"
                    {...register('password')}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    placeholder="Enter password"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    {...register('confirmPassword')}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    placeholder="Confirm password"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Password change option for existing users */}
            {isEdit && (
              <div className="md:col-span-2">
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg dark:bg-yellow-900/30 dark:border-yellow-800">
                  <h3 className="font-medium text-yellow-800 dark:text-yellow-400 mb-2">
                    Change Password
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                    Leave these fields blank to keep the current password.
                  </p>
                  
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                        New Password
                      </label>
                      <input
                        type="password"
                        {...register('password')}
                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        placeholder="Enter new password"
                      />
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.password.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        {...register('confirmPassword')}
                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2.5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                        placeholder="Confirm new password"
                      />
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
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
              {isEdit ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  );
};

export default UserForm;