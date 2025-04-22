import React from 'react';

function Modal({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
      {/* Modal panel */}
      <div 
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-gray-100 dark:border-gray-700/60 flex justify-between items-center">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">
            {data.datasetLabel} - {data.label}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <span className="sr-only">Close</span>
            <svg className="w-4 h-4 fill-current" viewBox="0 0 16 16">
              <path d="M12.72 3.293a1 1 0 00-1.415 0L8.012 6.586 4.72 3.293a1 1 0 00-1.414 1.414L6.598 8l-3.293 3.293a1 1 0 101.414 1.414l3.293-3.293 3.293 3.293a1 1 0 001.414-1.414L9.426 8l3.293-3.293a1 1 0 000-1.414z" />
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          <div className="mb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Value</p>
            <p className="text-lg font-medium text-gray-800 dark:text-gray-100">
              {data.datasetLabel === 'Direct' || data.datasetLabel === 'Indirect' 
                ? `${data.value.toLocaleString()} visits` 
                : data.value}
            </p>
          </div>
          
          {/* Top Channels Table */}
          <div className="mt-4">
            <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Top Channels</h4>
            <div className="overflow-x-auto">
              <table className="table-auto w-full dark:text-gray-300">
                {/* Table header */}
                <thead className="text-xs uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/50 rounded-xs">
                  <tr>
                    <th className="p-2">
                      <div className="font-semibold text-left">Source</div>
                    </th>
                    <th className="p-2">
                      <div className="font-semibold text-center">Visitors</div>
                    </th>
                    <th className="p-2">
                      <div className="font-semibold text-center">Revenues</div>
                    </th>
                    <th className="p-2">
                      <div className="font-semibold text-center">Conversion</div>
                    </th>
                  </tr>
                </thead>
                {/* Table body */}
                <tbody className="text-sm font-medium divide-y divide-gray-100 dark:divide-gray-700/60">
                  {/* We'll show filtered data based on the selected bar */}
                  <tr>
                    <td className="p-2">
                      <div className="flex items-center">
                        <svg className="shrink-0 mr-2 sm:mr-3" width="24" height="24" viewBox="0 0 36 36">
                          <circle fill="#24292E" cx="18" cy="18" r="18" />
                          <path
                            d="M18 10.2c-4.4 0-8 3.6-8 8 0 3.5 2.3 6.5 5.5 7.6.4.1.5-.2.5-.4V24c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.3 1.9.9 2.3.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8.6-.2 1.3-.3 2-.3s1.4.1 2 .3c1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.1 0 3.1-1.9 3.7-3.7 3.9.3.4.6.9.6 1.6v2.2c0 .2.1.5.6.4 3.2-1.1 5.5-4.1 5.5-7.6-.1-4.4-3.7-8-8.1-8z"
                            fill="#FFF"
                          />
                        </svg>
                        <div className="text-gray-800 dark:text-gray-100">Github.com</div>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="text-center">648</div>
                    </td>
                    <td className="p-2">
                      <div className="text-center text-green-500">$1,200</div>
                    </td>
                    <td className="p-2">
                      <div className="text-center text-sky-500">4.9%</div>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2">
                      <div className="flex items-center">
                        <svg className="shrink-0 mr-2 sm:mr-3" width="24" height="24" viewBox="0 0 36 36">
                          <circle fill="#1877F2" cx="18" cy="18" r="18" />
                          <path
                            d="M16.023 26 16 19h-3v-3h3v-2c0-2.7 1.672-4 4.08-4 1.153 0 2.144.086 2.433.124v2.821h-1.67c-1.31 0-1.563.623-1.563 1.536V16H23l-1 3h-2.72v7h-3.257Z"
                            fill="#FFF"
                            fillRule="nonzero"
                          />
                        </svg>
                        <div className="text-gray-800 dark:text-gray-100">Facebook</div>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="text-center">520</div>
                    </td>
                    <td className="p-2">
                      <div className="text-center text-green-500">$880</div>
                    </td>
                    <td className="p-2">
                      <div className="text-center text-sky-500">4.3%</div>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-2">
                      <div className="flex items-center">
                        <svg className="shrink-0 mr-2 sm:mr-3" width="24" height="24" viewBox="0 0 36 36">
                          <circle fill="#EA4335" cx="18" cy="18" r="18" />
                          <path
                            d="M18 17v2.4h4.1c-.2 1-1.2 3-4 3-2.4 0-4.3-2-4.3-4.4 0-2.4 2-4.4 4.3-4.4 1.4 0 2.3.6 2.8 1.1l1.9-1.8C21.6 11.7 20 11 18.1 11c-3.9 0-7 3.1-7 7s3.1 7 7 7c4 0 6.7-2.8 6.7-6.8 0-.5 0-.8-.1-1.2H18z"
                            fill="#FFF"
                            fillRule="nonzero"
                          />
                        </svg>
                        <div className="text-gray-800 dark:text-gray-100">Google (organic)</div>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="text-center">480</div>
                    </td>
                    <td className="p-2">
                      <div className="text-center text-green-500">$780</div>
                    </td>
                    <td className="p-2">
                      <div className="text-center text-sky-500">4.0%</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700/60 flex justify-end">
          <button
            onClick={onClose}
            className="btn-sm bg-primary text-white hover:bg-primary-dark"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;