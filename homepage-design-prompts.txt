You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
modern-hero-section.tsx
import React from 'react';
import { cn } from '@/lib/utils'; // Assumes a 'cn' utility for classnames

// Define the props for the component
interface HeroCollageProps extends React.HTMLAttributes<HTMLDivElement> {
  title: React.ReactNode;
  subtitle: string;
  stats: { value: string; label: string }[];
  images: string[];
}

// Keyframes for the floating animation
const animationStyle = `
  @keyframes float-up {
    0% { transform: translateY(0px); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
    50% { transform: translateY(-15px); box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.3); }
    100% { transform: translateY(0px); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
  }
  .animate-float-up {
    animation: float-up 6s ease-in-out infinite;
  }
`;

const HeroCollage = React.forwardRef<HTMLDivElement, HeroCollageProps>(
  ({ className, title, subtitle, stats, images, ...props }, ref) => {
    // We need exactly 7 images for this layout
    const displayImages = images.slice(0, 7);

    return (
      <>
        <style>{animationStyle}</style>
        <section
          ref={ref}
          className={cn(
            'relative w-full bg-background font-sans py-20 sm:py-32 overflow-hidden',
            className
          )}
          {...props}
        >
          {/* Main Content */}
          <div className="container relative z-10 mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base md:text-lg text-muted-foreground">
              {subtitle}
            </p>
          </div>

          {/* Image Collage - Updated Layout */}
          <div className="relative z-0 mt-20 h-[600px] flex items-center justify-center">
            <div className="relative h-full w-full max-w-6xl">
              {/* Central Image */}
              {displayImages[0] && (
                <img
                  src={displayImages[0]}
                  alt="Main feature"
                  className="absolute left-1/2 top-1/2 h-auto w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-2xl shadow-2xl z-20 animate-float-up"
                  style={{ animationDelay: '0s' }}
                />
              )}
              {/* Top-Left */}
              {displayImages[1] && (
                <img
                  src={displayImages[1]}
                  alt="Feature 2"
                  className="absolute left-[22%] top-[15%] h-auto w-52 rounded-xl shadow-lg z-10 animate-float-up"
                  style={{ animationDelay: '-1.2s' }}
                />
              )}
              {/* Top-Right */}
              {displayImages[2] && (
                <img
                  src={displayImages[2]}
                  alt="Feature 3"
                  className="absolute right-[24%] top-[10%] h-auto w-48 rounded-xl shadow-lg z-10 animate-float-up"
                  style={{ animationDelay: '-2.5s' }}
                />
              )}
              {/* Bottom-Right */}
              {displayImages[3] && (
                <img
                  src={displayImages[3]}
                  alt="Feature 4"
                  className="absolute right-[20%] bottom-[12%] h-auto w-60 rounded-xl shadow-lg z-30 animate-float-up"
                  style={{ animationDelay: '-3.5s' }}
                />
              )}
               {/* Far-Right */}
              {displayImages[4] && (
                <img
                  src={displayImages[4]}
                  alt="Feature 5"
                  className="absolute right-[5%] top-1/2 -translate-y-[60%] h-auto w-52 rounded-xl shadow-lg z-10 animate-float-up"
                   style={{ animationDelay: '-4.8s' }}
                />
              )}
              {/* Bottom-Left */}
              {displayImages[5] && (
                <img
                  src={displayImages[5]}
                  alt="Feature 6"
                  className="absolute left-[18%] bottom-[8%] h-auto w-56 rounded-xl shadow-lg z-30 animate-float-up"
                   style={{ animationDelay: '-5.2s' }}
                />
              )}
              {/* Far-Left */}
              {displayImages[6] && (
                <img
                  src={displayImages[6]}
                  alt="Feature 7"
                  className="absolute left-[5%] top-[25%] h-auto w-48 rounded-xl shadow-lg z-10 animate-float-up"
                   style={{ animationDelay: '-6s' }}
                />
              )}
            </div>
          </div>

          {/* Stats Section */}
          <div className="container relative z-10 mx-auto mt-16 px-4">
            <div className="flex flex-col items-center justify-center gap-8 sm:flex-row sm:gap-16">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-4xl font-bold tracking-tight text-blue-600">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </>
    );
  }
);

HeroCollage.displayName = 'HeroCollage';

export { HeroCollage };

demo.tsx
import { HeroCollage } from '@/components/ui/modern-hero-section'; // Adjust path as needed

// Demo component to showcase the HeroCollage
export default function HeroCollageDemo() {
  const stats = [
    { value: '3,888,846+', label: 'Users Trusted' },
    { value: '16,015,507+', label: 'Images Processed' },
  ];

  const unsplashImages = [
    // Central Image: Portrait
    'https://plus.unsplash.com/premium_photo-1670282392820-e3590c1c5c54?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjF8fGdpcmx8ZW58MHx8MHx8fDA%3D',
    // Top-Left (Before/After concept)
    'https://images.unsplash.com/photo-1652161468447-d8abb529b464?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmVmb3JlJTIwYW5kJTIwYWZ0ZXJ8ZW58MHx8MHx8fDA%3D',
    // Top-Right (Daisies)
    'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3',
    // Bottom-Right (Sliders/Beach)
    'https://images.unsplash.com/photo-1500964757637-c85e8a162699?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3',
    // Far-Right (Sunflowers)
    'https://images.unsplash.com/photo-1596639410348-8470f7fa9f84?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3',
    // Bottom-Left (Product)
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400&auto=format&fit=crop&ixlib=rb-4.0.3',
    // Far-Left (Rainbow)
    'https://images.unsplash.com/photo-1532135468830-e51699205b70?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fHJhaW5ib3d8ZW58MHx8MHx8fDA%3D',
  ];

  return (
    <div className="w-full">
      <HeroCollage
        title={
          <>
            Free <span className="text-blue-600">AI Photo Editor</span>
          </>
        }
        subtitle="Supercharge your editing 10x faster and easier than ever with AIEASE’s a diverse of AI-powered toolsets. Use our all-in-one online free AI photo editor to deliver perfect and professional images."
        stats={stats}
        images={unsplashImages}
      />
    </div>
  );
}

```

Implementation Guidelines
 1. Analyze the component structure and identify all required dependencies
 2. Review the component's argumens and state
 3. Identify any required context providers or hooks and install them
 4. Questions to Ask
 - What data/props will be passed to this component?
 - Are there any specific state management requirements?
 - Are there any required assets (images, icons, etc.)?
 - What is the expected responsive behavior?
 - What is the best place to use this component in the app?

Steps to integrate
 0. Copy paste all the code above in the correct directories
 1. Install external dependencies
 2. Fill image assets with Unsplash stock images you know exist
 3. Use lucide-react icons for svgs or logos if component requires them
