interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
}

export function EmptyState({ icon = "📭", title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-4xl mb-3">{icon}</span>
      <p className="text-gray-300 font-medium">{title}</p>
      {description && <p className="text-gray-500 text-sm mt-1">{description}</p>}
    </div>
  );
}
