import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <Container className="grid min-h-[calc(100svh-10rem)] place-items-center py-16">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin login</CardTitle>
          <CardDescription>
            Placeholder login UI for future Supabase auth. Access control is not
            implemented yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="admin@kspa.online" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
            <Button type="button">Sign in</Button>
            <p className="text-sm text-muted-foreground">
              After auth is connected, this route can redirect into{" "}
              <Link className="font-medium text-primary" href="/admin">
                /admin
              </Link>
              .
            </p>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
}

