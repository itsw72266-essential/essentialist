import React from 'react';

// Tiny helper to join class names without extra deps
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

const TabsContext = React.createContext(null);

export function Tabs({
  defaultValue,
  value: controlledValue,
  onValueChange,
  className,
  children,
  ...props
}) {
  const isControlled = controlledValue !== undefined;
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const value = isControlled ? controlledValue : uncontrolledValue;

  const setValue = (v) => {
    if (!isControlled) setUncontrolledValue(v);
    if (onValueChange) onValueChange(v);
  };

  const context = React.useMemo(() => ({ value, setValue }), [value]);

  return (
    <TabsContext.Provider value={context}>
      <div className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, ...props }) {
  return (
    <div
      role="tablist"
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-600',
        className
      )}
      {...props}
    />
  );
}

export function TabsTrigger({ value, className, ...props }) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error('TabsTrigger must be used within <Tabs>');
  const selected = ctx.value === value;

  return (
    <button
      role="tab"
      type="button"
      aria-selected={selected}
      aria-controls={`tab-${value}`}
      onClick={() => ctx.setValue(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
        selected ? 'bg-white text-gray-900 shadow' : 'text-gray-600 hover:text-gray-900',
        className
      )}
      {...props}
    />
  );
}

export function TabsContent({ value, className, children, ...props }) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error('TabsContent must be used within <Tabs>');
  const selected = ctx.value === value;

  return (
    <div
      role="tabpanel"
      id={`tab-${value}`}
      hidden={!selected}
      className={cn('mt-3', className)}
      {...props}
    >
      {selected ? children : null}
    </div>
  );
}

export default Tabs;