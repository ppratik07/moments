// components/LayoutPickerModal.tsx
'use client';

import { Dialog } from '@headlessui/react';
import { LayoutGrid } from 'lucide-react';

const layoutCategories = [
  {
    title: 'Message Only',
    layouts: [[[1]], [[2]]],
  },
  {
    title: 'Photos Only',
    layouts: [
      [[1, 1]],
      [[1], [1]],
      [[1, 1], [1]],
      [[1], [1, 1]],
      [[1, 1], [1, 1]],
    ],
  },
  {
    title: 'Message with Photos',
    layouts: [
      [[1], [2]],
      [[2], [1]],
      [[1, 1], [1]],
      [[1, 1], [2]],
      [[1], [1, 1]],
    ],
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (layoutId: number) => void;
  selectedLayout: number | null;
}

export default function LayoutPickerModal({
  open,
  onClose,
  onSelect,
  selectedLayout,
}: Props) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 text-xl font-semibold">
              <LayoutGrid className="w-5 h-5 text-purple-600" />
              Pick a Layout
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
              ✕
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-6">Click a layout below to use it</p>

          {layoutCategories.map((category, catIdx) => (
            <div key={catIdx} className="mb-6">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">{category.title}</h3>
              <div className="flex flex-wrap gap-3">
                {category.layouts.map((rows, layoutIdx) => {
                  const layoutId = layoutIdx + catIdx * 10;
                  const isSelected = selectedLayout === layoutId;
                  return (
                    <button
                      key={layoutIdx}
                      className={`border transition-colors duration-200 ${
                        isSelected ? 'border-purple-600 ring-2 ring-purple-200' : 'border-gray-200'
                      } rounded-md p-2 bg-white hover:shadow-md`}
                      onClick={() => onSelect(layoutId)}
                    >
                      <div className="w-20 h-16 bg-gray-50 grid gap-1 p-1">
                        {rows.map((cols, i) => (
                          <div key={i} className="flex gap-1 flex-1">
                            {cols.map((col, j) => (
                              <div
                                key={j}
                                className="bg-blue-300 rounded-sm"
                                style={{ flex: col, height: '100%' }}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={onClose}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              className="bg-purple-600 text-white text-sm px-4 py-1.5 rounded hover:bg-purple-700"
            >
              Add
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
