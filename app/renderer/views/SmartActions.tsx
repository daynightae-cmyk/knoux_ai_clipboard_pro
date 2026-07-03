import React from 'react';
import { Zap, Play, Settings, Plus, Trash2, Edit } from 'lucide-react';
import i18n from '../utils/i18n';

const SmartActions: React.FC = () => {
  const actions = [
    {
      id: 1,
      name: 'Format JSON',
      trigger: 'When clipboard contains JSON',
      action: 'Prettify and highlight syntax',
      active: true
    },
    {
      id: 2,
      name: 'Extract Emails',
      trigger: 'When text contains email addresses',
      action: 'Create a list of unique emails',
      active: true
    },
    {
      id: 3,
      name: 'Translate to English',
      trigger: 'When text is not English',
      action: 'Translate using AI model',
      active: false
    },
    {
      id: 4,
      name: 'Remove Tracking Params',
      trigger: 'When copying a URL',
      action: 'Strip utm_source, fbclid, etc.',
      active: true
    }
  ];

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Zap className="w-8 h-8 text-blue-400" />
              {i18n.t('sidebar.smartActions') || 'Smart Actions'}
            </h1>
            <p className="text-gray-400">Automate your workflow with intelligent triggers.</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" />
            Create Action
          </button>
        </div>

        <div className="grid gap-4">
          {actions.map((action) => (
            <div key={action.id} className="bg-black/40 border border-white/10 rounded-xl p-6 flex items-center justify-between group hover:border-blue-500/30 transition-all">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${action.active ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700/20 text-gray-500'}`}>
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{action.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Play className="w-3 h-3" /> {action.trigger}
                    </span>
                    <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
                    <span>{action.action}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-white/10 mx-2"></div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={action.active} readOnly />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SmartActions;
