import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  /* ── Tags ── */
  const tagDefs = [
    "Technology", "Programming", "Design", "AI", "Web Development",
    "JavaScript", "React", "TypeScript", "CSS", "Node.js",
    "Productivity", "Career", "Open Source", "DevOps", "Security",
  ];

  const tags = await Promise.all(
    tagDefs.map((name) =>
      prisma.tag.upsert({
        where: { slug: name.toLowerCase().replace(/\s+/g, "-") },
        update: {},
        create: { name, slug: name.toLowerCase().replace(/\s+/g, "-") },
      })
    )
  );

  const t = Object.fromEntries(tags.map((tag) => [tag.name, tag]));

  /* ── Users ── */
  const pw = await bcrypt.hash("password123", 12);

  const alex = await prisma.user.upsert({
    where: { email: "alex@blogosphere.com" },
    update: {},
    create: {
      name: "Alex Morgan",
      email: "alex@blogosphere.com",
      password: pw,
      bio: "Full-stack developer & technical writer. Building things on the web since 2012.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
    },
  });

  const priya = await prisma.user.upsert({
    where: { email: "priya@blogosphere.com" },
    update: {},
    create: {
      name: "Priya Sharma",
      email: "priya@blogosphere.com",
      password: pw,
      bio: "UI/UX designer passionate about accessible and beautiful interfaces.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya",
    },
  });

  const kai = await prisma.user.upsert({
    where: { email: "kai@blogosphere.com" },
    update: {},
    create: {
      name: "Kai Chen",
      email: "kai@blogosphere.com",
      password: pw,
      bio: "AI researcher and developer. Writing about machine learning, LLMs, and the future of tech.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=kai",
    },
  });

  const sam = await prisma.user.upsert({
    where: { email: "sam@blogosphere.com" },
    update: {},
    create: {
      name: "Sam Torres",
      email: "sam@blogosphere.com",
      password: pw,
      bio: "DevOps engineer. Kubernetes enthusiast. Coffee addict.",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=sam",
    },
  });

  /* ── Posts ── */
  const posts = [
    {
      title: "Building a Full-Stack App with Next.js 15 and Prisma",
      slug: "full-stack-nextjs-15-prisma",
      content: `<h2>Introduction</h2><p>Next.js 15 combined with Prisma ORM is one of the most productive stacks available today. In this guide, we'll walk through building a complete full-stack application from scratch.</p><h2>Setting Up the Project</h2><p>Start by creating a new Next.js project with the App Router enabled.</p><pre><code>npx create-next-app@latest my-app --typescript --tailwind --app</code></pre><h2>Configuring Prisma</h2><p>Prisma provides a type-safe database client that integrates perfectly with TypeScript. Install it and initialize the schema:</p><pre><code>npm install prisma @prisma/client
npx prisma init</code></pre><h3>Defining Your Schema</h3><p>The Prisma schema is the single source of truth for your database structure. Here's a simple blog schema:</p><pre><code>model Post {
  id        String   @id @default(cuid())
  title     String
  content   String
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  createdAt DateTime @default(now())
}</code></pre><h2>Server Actions</h2><p>Next.js 15 Server Actions let you write database mutations directly in your components without building separate API routes. This massively reduces boilerplate:</p><pre><code>"use server";

export async function createPost(data: FormData) {
  const title = data.get("title") as string;
  await prisma.post.create({ data: { title, authorId: userId } });
  revalidatePath("/");
}</code></pre><h2>Conclusion</h2><p>The Next.js + Prisma stack gives you end-to-end type safety, great developer experience, and the performance characteristics you need for production apps.</p>`,
      excerpt: "A practical guide to building full-stack applications with Next.js 15 and Prisma ORM — from schema design to deployment.",
      published: true,
      featured: true,
      readTime: 8,
      authorId: alex.id,
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      views: 1240,
      tags: [t["Web Development"], t["JavaScript"], t["TypeScript"]],
    },
    {
      title: "TypeScript Generics: From Beginner to Advanced",
      slug: "typescript-generics-beginner-to-advanced",
      content: `<h2>What are Generics?</h2><p>Generics are one of TypeScript's most powerful features, allowing you to write reusable, type-safe code that works with multiple types. Think of them as type-level functions — they take types as arguments and return new types.</p><h2>Basic Syntax</h2><p>The simplest generic is a function that returns whatever you pass in:</p><pre><code>function identity&lt;T&gt;(arg: T): T {
  return arg;
}

const num = identity(42);        // T = number
const str = identity("hello");   // T = string</code></pre><h2>Generic Constraints</h2><p>You can restrict what types can be used with a generic using the <code>extends</code> keyword:</p><pre><code>function getLength&lt;T extends { length: number }&gt;(arg: T): number {
  return arg.length;
}

getLength("hello");  // OK — string has length
getLength([1, 2, 3]); // OK — array has length
getLength(42);       // Error — number has no length</code></pre><h2>Generic Interfaces and Types</h2><p>Generics shine when building reusable data structures:</p><pre><code>interface ApiResponse&lt;T&gt; {
  data: T;
  status: number;
  message: string;
}

type UserResponse = ApiResponse&lt;User&gt;;
type PostListResponse = ApiResponse&lt;Post[]&gt;;</code></pre><h2>Conditional Types</h2><p>Advanced TypeScript allows you to branch on type conditions:</p><pre><code>type IsArray&lt;T&gt; = T extends any[] ? true : false;

type A = IsArray&lt;number[]&gt;; // true
type B = IsArray&lt;string&gt;;   // false</code></pre><h2>Mapped Types</h2><p>Mapped types let you transform the properties of an existing type:</p><pre><code>type Readonly&lt;T&gt; = {
  readonly [K in keyof T]: T[K];
};

type Optional&lt;T&gt; = {
  [K in keyof T]?: T[K];
};</code></pre><h2>Conclusion</h2><p>Generics unlock a new level of expressiveness in TypeScript. Start with simple generic functions, then gradually work up to conditional and mapped types as you need them.</p>`,
      excerpt: "Master TypeScript generics — from simple type parameters to conditional types, mapped types, and real-world utility patterns.",
      published: true,
      featured: true,
      readTime: 10,
      authorId: alex.id,
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      views: 892,
      tags: [t["TypeScript"], t["Programming"], t["JavaScript"]],
    },
    {
      title: "Design Systems in 2025: Building for Scale",
      slug: "design-systems-2025-building-for-scale",
      content: `<h2>Why Design Systems Matter</h2><p>A design system is more than a component library — it's a shared language between design and engineering. At scale, a well-maintained design system can save hundreds of hours per quarter and dramatically improve consistency across products.</p><h2>The Anatomy of a Modern Design System</h2><h3>Design Tokens</h3><p>Design tokens are the atomic values that define your visual language. Rather than hardcoding colors, spacing, or typography, you define them as variables:</p><pre><code>// tokens.ts
export const tokens = {
  color: {
    primary: { 500: "#3b82f6", 600: "#2563eb" },
    neutral: { 50: "#f8fafc", 900: "#0f172a" },
  },
  spacing: { 1: "4px", 2: "8px", 4: "16px" },
  fontSize: { sm: "0.875rem", base: "1rem", lg: "1.125rem" },
};</code></pre><h3>Component Architecture</h3><p>Components should be designed with composition in mind. The best design systems have small, focused primitives that combine into larger patterns:</p><ul><li><strong>Primitives</strong>: Box, Text, Stack, Grid</li><li><strong>Components</strong>: Button, Input, Card, Badge</li><li><strong>Patterns</strong>: Form, DataTable, Navigation</li><li><strong>Templates</strong>: Page layouts, dashboards</li></ul><h2>Documentation is the Product</h2><p>The best component in the world is useless if developers don't know how to use it. Invest in documentation with live examples, accessibility notes, and usage guidelines.</p><h2>Versioning and Governance</h2><p>Treat your design system like a product. Use semantic versioning, maintain a changelog, and establish a clear RFC (Request for Comments) process for changes.</p><h2>Measuring Success</h2><p>Track adoption rates, time-to-ship for new features, and design consistency scores. These metrics will justify investment and guide improvements.</p>`,
      excerpt: "How to build a design system that actually scales — design tokens, component architecture, documentation, and governance.",
      published: true,
      featured: true,
      readTime: 7,
      authorId: priya.id,
      publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      views: 654,
      tags: [t["Design"], t["CSS"], t["Web Development"]],
    },
    {
      title: "Understanding Large Language Models: A Developer's Guide",
      slug: "understanding-large-language-models-developers-guide",
      content: `<h2>What is an LLM?</h2><p>A Large Language Model (LLM) is a neural network trained on massive amounts of text data. It learns to predict the next token (roughly, word piece) given the preceding context. From this simple objective emerges remarkably sophisticated capabilities: reasoning, coding, translation, and more.</p><h2>How Transformers Work</h2><p>Modern LLMs are based on the Transformer architecture, introduced in the 2017 paper "Attention is All You Need". The key innovation is <strong>self-attention</strong>: a mechanism that allows each token to attend to all other tokens in the sequence, learning rich contextual relationships.</p><h3>The Attention Mechanism</h3><p>Mathematically, attention is computed as:</p><pre><code>Attention(Q, K, V) = softmax(QK^T / sqrt(d_k)) * V</code></pre><p>Where Q (queries), K (keys), and V (values) are learned projections of the input. This allows the model to dynamically weight which parts of the input are most relevant to each position.</p><h2>Prompting Strategies</h2><p>Getting good results from LLMs is a skill. Here are the most effective techniques:</p><h3>Few-shot Prompting</h3><p>Providing examples before your actual request dramatically improves output quality:</p><pre><code>Classify sentiment:
Input: "I love this product!" → Positive
Input: "Terrible experience." → Negative
Input: "It was okay I guess." → ?</code></pre><h3>Chain-of-Thought</h3><p>Asking the model to think step-by-step before giving an answer improves reasoning accuracy, especially on math and logic problems.</p><h2>Using the API</h2><p>Most LLMs expose a simple REST API. Here's a minimal example with the Anthropic SDK:</p><pre><code>import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const message = await client.messages.create({
  model: "claude-opus-4-6",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Explain self-attention." }],
});</code></pre><h2>Conclusion</h2><p>LLMs are the most powerful general-purpose tool in software since the internet. Understanding how they work will help you use them more effectively and build better products on top of them.</p>`,
      excerpt: "A practical introduction to Large Language Models — how they work, how to prompt them effectively, and how to build with them.",
      published: true,
      featured: false,
      readTime: 9,
      authorId: kai.id,
      publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      views: 2103,
      tags: [t["AI"], t["Programming"], t["Technology"]],
    },
    {
      title: "CSS Grid vs Flexbox: When to Use Which",
      slug: "css-grid-vs-flexbox-when-to-use-which",
      content: `<h2>The Short Answer</h2><p>Use <strong>Flexbox</strong> for one-dimensional layouts (a row or a column). Use <strong>CSS Grid</strong> for two-dimensional layouts (rows AND columns simultaneously). In practice, you'll often use both in the same project — they complement each other perfectly.</p><h2>Flexbox: The One-Dimension Champion</h2><p>Flexbox excels at distributing space along a single axis and aligning items within a container:</p><pre><code>.nav {
  display: flex;
  align-items: center;
  gap: 1rem;
  justify-content: space-between;
}</code></pre><p>It's perfect for: navigation bars, button groups, centering content, card footers, and anywhere you need items in a single line with smart spacing.</p><h2>CSS Grid: Two-Dimensional Layouts</h2><p>Grid gives you explicit control over both rows and columns:</p><pre><code>.dashboard {
  display: grid;
  grid-template-columns: 240px 1fr 320px;
  grid-template-rows: auto 1fr;
  min-height: 100vh;
}

.sidebar { grid-row: 1 / -1; }
.header  { grid-column: 1 / -1; }</code></pre><h3>The fr Unit</h3><p>The <code>fr</code> (fraction) unit is Grid's superpower — it distributes available space proportionally:</p><pre><code>grid-template-columns: 1fr 2fr 1fr;
/* Middle column gets twice the space */</code></pre><h2>Auto-placement and minmax</h2><p>Grid's auto-placement algorithm can create responsive layouts with zero media queries:</p><pre><code>.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}</code></pre><p>This creates as many columns as fit, each at least 280px wide — no breakpoints needed.</p><h2>My Decision Framework</h2><ul><li>Aligning items in a toolbar or nav? → Flexbox</li><li>Building a page layout with sidebar? → Grid</li><li>Card grid that should reflow? → Grid with auto-fill</li><li>Button with icon and text? → Flexbox</li><li>Complex form with labels and inputs? → Grid</li></ul>`,
      excerpt: "The definitive guide to choosing between CSS Grid and Flexbox — with practical examples and a decision framework you can use every day.",
      published: true,
      featured: false,
      readTime: 6,
      authorId: priya.id,
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      views: 1876,
      tags: [t["CSS"], t["Design"], t["Web Development"]],
    },
    {
      title: "Docker and Kubernetes: From Zero to Production",
      slug: "docker-kubernetes-zero-to-production",
      content: `<h2>Why Containers?</h2><p>Containers solve the classic "it works on my machine" problem. By packaging your application with all its dependencies into a portable unit, you get consistent behavior from development to production.</p><h2>Docker Fundamentals</h2><h3>Writing a Good Dockerfile</h3><p>The order of instructions matters — Docker caches each layer. Put things that change rarely at the top:</p><pre><code>FROM node:20-alpine AS base

# Dependencies rarely change, so cache them
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Source code changes often
COPY . .
RUN npm run build

# Production image — minimal size
FROM node:20-alpine AS production
WORKDIR /app
COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/index.js"]</code></pre><h2>Kubernetes: Orchestration at Scale</h2><p>When you have multiple containers that need to communicate, scale, and recover from failures, you need an orchestrator. Kubernetes (K8s) is the industry standard.</p><h3>Core Concepts</h3><ul><li><strong>Pod</strong>: The smallest deployable unit — one or more containers sharing a network namespace</li><li><strong>Deployment</strong>: Manages replicas of a Pod, handles rolling updates</li><li><strong>Service</strong>: Stable network endpoint for a set of Pods</li><li><strong>Ingress</strong>: Routes external HTTP traffic to Services</li></ul><h3>A Simple Deployment</h3><pre><code>apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    spec:
      containers:
        - name: my-app
          image: my-app:1.0.0
          ports:
            - containerPort: 3000
          resources:
            requests:
              memory: "128Mi"
              cpu: "100m"
            limits:
              memory: "256Mi"
              cpu: "500m"</code></pre><h2>Health Checks</h2><p>Always configure liveness and readiness probes. Without them, Kubernetes can't tell if your app is actually working:</p><pre><code>livenessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10</code></pre><h2>Conclusion</h2><p>Docker and Kubernetes form the backbone of modern application deployment. The learning curve is real, but the operational benefits — reliability, scalability, and consistency — are worth it.</p>`,
      excerpt: "A practical guide to containerizing applications with Docker and deploying them to production with Kubernetes.",
      published: true,
      featured: false,
      readTime: 11,
      authorId: sam.id,
      publishedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      views: 743,
      tags: [t["DevOps"], t["Technology"], t["Node.js"]],
    },
    {
      title: "React Performance Optimization: The Complete Guide",
      slug: "react-performance-optimization-complete-guide",
      content: `<h2>Start with Measurement</h2><p>Never optimize blindly. Use React DevTools Profiler, Chrome Performance tab, and Lighthouse to identify actual bottlenecks before writing a single line of optimization code.</p><h2>The Most Common Performance Killers</h2><h3>1. Unnecessary Re-renders</h3><p>Every state change in a parent re-renders all children. Use <code>React.memo</code> to skip re-renders when props haven't changed:</p><pre><code>const ExpensiveComponent = React.memo(({ data }) => {
  // Only re-renders when 'data' actually changes
  return &lt;div&gt;{processData(data)}&lt;/div&gt;;
});</code></pre><h3>2. Expensive Calculations on Every Render</h3><p>Use <code>useMemo</code> to cache expensive computations:</p><pre><code>const sortedUsers = useMemo(
  () => users.sort((a, b) => a.name.localeCompare(b.name)),
  [users] // Only re-compute when users changes
);</code></pre><h3>3. Unstable Function References</h3><p>Functions defined in a component body are recreated on every render. This breaks <code>React.memo</code> for child components and causes unnecessary effect re-runs:</p><pre><code>// Bad: new function reference every render
const handleClick = () => submitForm(data);

// Good: stable reference
const handleClick = useCallback(() => submitForm(data), [data]);</code></pre><h2>Code Splitting</h2><p>Don't ship all your code upfront. Use dynamic imports to split your bundle and only load code when needed:</p><pre><code>const HeavyChart = lazy(() => import("./HeavyChart"));

function Dashboard() {
  return (
    &lt;Suspense fallback={&lt;Skeleton /&gt;}&gt;
      &lt;HeavyChart data={chartData} /&gt;
    &lt;/Suspense&gt;
  );
}</code></pre><h2>Virtualization for Long Lists</h2><p>Rendering thousands of DOM nodes is slow. Use a virtualization library like <code>react-window</code> to only render visible items.</p><h2>Image Optimization</h2><p>Use Next.js's <code>&lt;Image&gt;</code> component or <code>loading="lazy"</code> on images. Serve modern formats (WebP, AVIF) and use appropriate sizes.</p><h2>Key Takeaways</h2><ul><li>Measure first, optimize second</li><li>Avoid premature optimization — it adds complexity</li><li>Most React apps don't need aggressive memoization</li><li>Bundle size and initial load often matter more than render performance</li></ul>`,
      excerpt: "A practical guide to React performance — identifying bottlenecks, strategic memoization, code splitting, and virtualization.",
      published: true,
      featured: false,
      readTime: 9,
      authorId: alex.id,
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      views: 1562,
      tags: [t["React"], t["JavaScript"], t["Web Development"]],
    },
    {
      title: "The Art of Writing Clean Code",
      slug: "the-art-of-writing-clean-code",
      content: `<h2>Why Clean Code Matters</h2><p>Writing clean code isn't just about aesthetics — it's about maintainability, readability, and reducing the cognitive load for everyone who works with the codebase. The code you write today will be read many more times than it's written.</p><h2>Naming is Communication</h2><p>Choose names that reveal intent. A well-named variable or function is worth far more than a comment explaining a poorly-named one:</p><pre><code>// Bad
const d = new Date();
const x = users.filter(u => u.a > 18);

// Good
const today = new Date();
const adultUsers = users.filter(user => user.age > 18);</code></pre><h2>Functions Should Do One Thing</h2><p>The Single Responsibility Principle applies at every level. A function that does one thing is easier to test, easier to name, and easier to reuse:</p><pre><code>// Bad: doing too much
async function processOrder(order) {
  validateOrder(order);
  await saveToDatabase(order);
  sendConfirmationEmail(order);
  updateInventory(order);
}

// Good: clear separation
async function processOrder(order) {
  const validatedOrder = validateOrder(order);
  const savedOrder = await saveOrder(validatedOrder);
  await Promise.all([
    notifyCustomer(savedOrder),
    updateInventory(savedOrder),
  ]);
  return savedOrder;
}</code></pre><h2>Comments: When and Why</h2><p>Don't comment what the code does — comment <em>why</em> it does it that way. Good comments explain context, not mechanics:</p><pre><code>// Bad: obvious from the code
// Increment counter by 1
counter++;

// Good: explains a non-obvious decision
// Use exponential backoff to avoid overwhelming the API
// during outages (learned from the production incident 2024-03)
const delay = Math.min(1000 * 2 ** retryCount, 30000);</code></pre><h2>Error Handling</h2><p>Handle errors explicitly. Silent failures and swallowed exceptions are bugs waiting to happen:</p><pre><code>// Bad
try {
  await doSomething();
} catch (e) {} // 🚫 Silent failure

// Good
try {
  await doSomething();
} catch (error) {
  logger.error("Failed to do something:", { error, context });
  throw new AppError("Operation failed", { cause: error });
}</code></pre>`,
      excerpt: "Principles and patterns for writing code that your future self (and your teammates) will actually enjoy reading.",
      published: true,
      featured: false,
      readTime: 7,
      authorId: alex.id,
      publishedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
      views: 2340,
      tags: [t["Programming"], t["Productivity"], t["Career"]],
    },
    {
      title: "Getting Started with AI-Powered Features in Your App",
      slug: "getting-started-ai-powered-features",
      content: `<h2>The AI Integration Landscape</h2><p>Adding AI to your application no longer requires a machine learning background. Modern AI APIs expose powerful capabilities through simple HTTP calls. The challenge is now deciding <em>what</em> to build and <em>how</em> to integrate it well.</p><h2>Common Use Cases</h2><ul><li><strong>Content generation</strong>: Drafting, summarizing, translating</li><li><strong>Classification</strong>: Sentiment analysis, moderation, categorization</li><li><strong>Extraction</strong>: Parsing structured data from unstructured text</li><li><strong>Embeddings</strong>: Semantic search, recommendations, deduplication</li></ul><h2>Structured Output</h2><p>For production use, avoid free-form text output. Ask the model to return JSON and validate it:</p><pre><code>const result = await client.messages.create({
  model: "claude-opus-4-6",
  max_tokens: 512,
  messages: [{
    role: "user",
    content: \`Extract the following from this job posting as JSON:
{ "title": string, "company": string, "salary": string | null }

Job posting: \${jobText}\`
  }]
});

const data = JSON.parse(result.content[0].text);
</code></pre><h2>Streaming Responses</h2><p>For long outputs, stream the response to improve perceived performance:</p><pre><code>const stream = await client.messages.stream({
  model: "claude-opus-4-6",
  max_tokens: 2048,
  messages: [{ role: "user", content: prompt }],
});

for await (const chunk of stream) {
  if (chunk.type === "content_block_delta") {
    process.stdout.write(chunk.delta.text);
  }
}</code></pre><h2>Handling Failures</h2><p>AI APIs can be slow and occasionally fail. Build resilient integrations with timeouts, retries, and graceful fallbacks:</p><pre><code>async function withAIFallback&lt;T&gt;(
  fn: () => Promise&lt;T&gt;,
  fallback: T
): Promise&lt;T&gt; {
  try {
    return await Promise.race([fn(), timeout(10_000)]);
  } catch {
    return fallback;
  }
}</code></pre><h2>Cost Management</h2><p>Tokens cost money. Cache responses where possible, use shorter prompts, and choose the smallest model that produces acceptable quality for your use case.</p>`,
      excerpt: "A practical guide to adding AI features to your web application — from API integration to streaming, structured output, and cost control.",
      published: true,
      featured: false,
      readTime: 8,
      authorId: kai.id,
      publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      views: 987,
      tags: [t["AI"], t["Programming"], t["Web Development"]],
    },
    {
      title: "Open Source Contribution: A Beginner's Roadmap",
      slug: "open-source-contribution-beginners-roadmap",
      content: `<h2>Why Contribute to Open Source?</h2><p>Beyond the resume benefit, contributing to open source makes you a better engineer. You'll read code written by some of the best developers in the world, learn how large codebases are structured, and build a public portfolio of real work.</p><h2>Finding the Right Project</h2><p>Don't jump straight to React or Node.js — start smaller. Look for projects you actually use and care about. GitHub's "good first issue" label exists specifically for new contributors.</p><h3>Good Starting Points</h3><ul><li>Tools you use daily (editors, CLIs, libraries)</li><li>Projects with clear contribution guides</li><li>Repos with responsive maintainers (check issue response times)</li><li>Projects with an active community (Discord, Slack)</li></ul><h2>Your First Contribution</h2><p>Documentation fixes, typo corrections, and test additions are legitimate and valuable contributions. Don't underestimate them — they matter.</p><h3>The Workflow</h3><pre><code># 1. Fork the repo on GitHub
# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/project.git

# 3. Create a branch
git checkout -b fix/typo-in-readme

# 4. Make your changes
# 5. Commit with a clear message
git commit -m "docs: fix typo in installation instructions"

# 6. Push and open a PR
git push origin fix/typo-in-readme</code></pre><h2>Writing a Good PR</h2><p>A good pull request tells a story. Include:</p><ul><li>What problem does this solve?</li><li>How does your change fix it?</li><li>How did you test it?</li><li>Screenshots if it's a visual change</li></ul><h2>When Your PR Gets Rejected</h2><p>It happens to everyone. Don't take it personally. Ask for feedback, learn from it, and try again. Many maintainers will work with you to get a contribution merged — be patient and responsive.</p><blockquote><p>The best contribution is the one you actually make.</p></blockquote>`,
      excerpt: "Everything you need to know to start contributing to open source — finding projects, workflow, writing good PRs, and handling feedback.",
      published: true,
      featured: false,
      readTime: 6,
      authorId: priya.id,
      publishedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
      views: 1123,
      tags: [t["Open Source"], t["Career"], t["Productivity"]],
    },
    {
      title: "Web Security Essentials Every Developer Must Know",
      slug: "web-security-essentials-developers",
      content: `<h2>Security is a Feature, Not an Afterthought</h2><p>Security vulnerabilities are embarrassing, expensive, and sometimes catastrophic. The good news: the most common vulnerabilities are entirely preventable with basic hygiene.</p><h2>The OWASP Top 10</h2><p>OWASP publishes the ten most critical web application security risks. Here are the ones most relevant to modern developers:</p><h3>1. SQL Injection</h3><p>Never interpolate user input into SQL queries. Always use parameterized queries:</p><pre><code>// DANGEROUS
const user = await db.query(
  \`SELECT * FROM users WHERE email = '\${email}'\`
);

// SAFE
const user = await db.query(
  "SELECT * FROM users WHERE email = $1",
  [email]
);</code></pre><h3>2. Cross-Site Scripting (XSS)</h3><p>Sanitize any user-generated content before rendering it as HTML. Modern frameworks like React escape output by default — but <code>dangerouslySetInnerHTML</code> bypasses this protection.</p><h3>3. Broken Authentication</h3><p>Common mistakes to avoid:</p><ul><li>Storing passwords in plaintext (use bcrypt, argon2, or scrypt)</li><li>Weak session tokens (use cryptographically random values)</li><li>No rate limiting on login endpoints (enables brute force)</li><li>Long session lifetimes with no refresh</li></ul><h2>Security Headers</h2><p>Set these HTTP headers on every response:</p><pre><code>Content-Security-Policy: default-src 'self'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000; includeSubDomains</code></pre><h2>Secrets Management</h2><p>Never commit secrets to git. Use environment variables, and consider a secrets manager (AWS Secrets Manager, HashiCorp Vault) for production. If you accidentally commit a secret, rotate it immediately — assume it's compromised.</p><h2>Dependency Security</h2><p>Run <code>npm audit</code> regularly and keep dependencies up to date. Subscribe to security advisories for packages you use. Consider tools like Snyk or GitHub Dependabot to automate this.</p>`,
      excerpt: "The security fundamentals every web developer needs to know — SQL injection, XSS, authentication, security headers, and secrets management.",
      published: true,
      featured: false,
      readTime: 8,
      authorId: sam.id,
      publishedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      views: 1890,
      tags: [t["Security"], t["Web Development"], t["Programming"]],
    },
  ];

  /* ── Create posts and tag connections ── */
  for (const { tags: postTags, ...postData } of posts) {
    const post = await prisma.post.upsert({
      where: { slug: postData.slug },
      update: {},
      create: postData,
    });

    for (const tag of postTags) {
      await prisma.postTag.upsert({
        where: { postId_tagId: { postId: post.id, tagId: tag.id } },
        update: {},
        create: { postId: post.id, tagId: tag.id },
      });
    }
  }

  console.log(`✓ Seeded ${posts.length} posts by 4 authors with ${tagDefs.length} tags`);
  console.log("  Login: alex@blogosphere.com / password123");
  console.log("  Login: priya@blogosphere.com / password123");
  console.log("  Login: kai@blogosphere.com / password123");
  console.log("  Login: sam@blogosphere.com / password123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
