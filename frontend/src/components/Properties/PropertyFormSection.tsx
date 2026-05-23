import { Property } from '../../types';

interface FormData {
  name: string;
  property_type: string;
  address: string;
  notes: string;
}

interface Props {
  formData: FormData;
  onFormChange: (data: FormData) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function PropertyFormSection({ formData, onFormChange, onSubmit }: Props) {
  return (
    <div className="card mb-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">New Property</h2>
      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
            className="form-input"
            placeholder="e.g., Downtown Apartment Complex"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">Type *</label>
          <select
            value={formData.property_type}
            onChange={(e) => onFormChange({ ...formData, property_type: e.target.value })}
            className="form-input"
          >
            <option value="sfh">Single Family Home</option>
            <option value="duplex">Duplex</option>
            <option value="triplex">Triplex</option>
            <option value="quad">Quadplex</option>
            <option value="multiunit">Multi-Unit</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">Address</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => onFormChange({ ...formData, address: e.target.value })}
            className="form-input"
            placeholder="Street address"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold mb-2 text-gray-800 dark:text-gray-200">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => onFormChange({ ...formData, notes: e.target.value })}
            className="form-input h-24 resize-none"
            placeholder="Additional notes or details"
          />
        </div>
        <div className="md:col-span-2 flex gap-3">
          <button type="submit" className="btn btn-primary">
            Create Property
          </button>
        </div>
      </form>
    </div>
  );
}
