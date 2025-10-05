
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface PlaceholderTabProps {
  title?: string;
  description?: string;
}

export function PlaceholderTab({ 
  title = "قادم قريباً", 
  description = "هذه الصفحة قيد التطوير" 
}: PlaceholderTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-muted-foreground">ستكون متاحة قريباً</p>
        </div>
      </CardContent>
    </Card>
  );
}
