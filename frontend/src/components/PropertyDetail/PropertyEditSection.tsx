import { Check, AlertCircle } from 'lucide-react';
import { Property } from '../../types';

interface Props {
  property: Property;
  saveStatus: 'saved' | 'saving' | 'unsaved';
  onPropertyChange: (field: keyof Property, value: any) => void;
}

export default function PropertyEditSection({ property, saveStatus, onPropertyChange }: Props) {
  return (
    <div className="card mb-10">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <input
            type="text"
            value={property.name || ''}
            onChange={(e) => onPropertyChange('name', e.target.value)}
            className="text-4xl font-bold bg-transparent border-b-2 border-transparent hover:border-primary-300 dark:hover:border-primary-700 focus:border-primary-500 focus:outline-none px-2 py-1 w-full text-gray-900 dark:text-white"
          />
        </div>
        <div className={`text-sm font-medium ml-4 whitespace-nowrap flex items-center gap-2 px-3 py-1 rounded-full ${
          saveStatus === 'saved' ? 'bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-200' :
          saveStatus === 'saving' ? 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200' :
          'bg-warning-100 dark:bg-warning-900 text-warning-800 dark:text-warning-200'
        }`}>
          {saveStatus === 'saved' && <><Check size={16} /> Saved</>}
          {saveStatus === 'saving' && <>⟳ Saving...</>}
          {saveStatus === 'unsaved' && <><AlertCircle size={16} /> Error</>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm font-semibold text-gray-800 dark:text-gray-200 block mb-2">Address</label>
          <input
            type="text"
            value={property.address || ''}
            onChange={(e) => onPropertyChange('address', e.target.value)}
            className="form-input"
            placeholder="Property address"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-800 dark:text-gray-200 block mb-2">Type</label>
          <select
            value={property.property_type || 'sfh'}
            onChange={(e) => onPropertyChange('property_type', e.target.value)}
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
      </div>

      <div className="mt-6">
        <label className="text-sm font-semibold text-gray-800 dark:text-gray-200 block mb-2">Notes</label>
        <textarea
          value={property.notes || ''}
          onChange={(e) => onPropertyChange('notes', e.target.value)}
          className="form-input h-24 resize-none"
          placeholder="Additional notes or details"
        />
      </div>
    </div>
  );
}
