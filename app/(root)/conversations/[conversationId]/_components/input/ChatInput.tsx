"use client";
import React from 'react'
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SendHorizonal } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { z } from "zod";
import { useConversation } from "@/hooks/useConversation";
import { useMutationState } from "@/hooks/useMutationState";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ConvexError } from "convex/values";
import { FC, useEffect, useRef, useState } from "react";
import TextareaAutosize from "react-textarea-autosize";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

type Props = {}

const chatMessageSchema = z.object({
  content: z.string().min(1, { message: "This field can't be empty" }),
});

const ChatInput = (props: Props) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { conversationId } = useConversation();
  const [cursorPosition, setCursorPosition] = useState(0);
  const { mutate: createMessage, pending } = useMutationState(
    api.message.create
  );

  const form = useForm<z.infer<typeof chatMessageSchema>>({
    resolver: zodResolver(chatMessageSchema),
    defaultValues: {
      content: "",
    },
  });


  const handleInputChange = (event: any) => {
    const { value, selectionStart } = event.target;
    if (selectionStart !== null) {
      form.setValue("content", value);
      setCursorPosition(selectionStart);
    }
  };

  const handleSubmit = async (values: z.infer<typeof chatMessageSchema>) => {
    createMessage({
      content: [values.content],
      type: "text",
      conversationId,
    })
      .then(() => {
        form.reset();
        textareaRef.current?.focus();

      })
      .catch((error) => {
        toast.error(
          error instanceof ConvexError
            ? error.data
            : "Unexpected error occurred"
        );
      });
  };

  return <Card className="w-full p-2 rounded-lg relative">
    <div className="flex gap-2 items-end w-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex gap-2 items-end w-full"
        >
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="h-full w-full">
                <FormControl>
                  <TextareaAutosize
                    onKeyDown={async (e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        await form.handleSubmit(handleSubmit)();
                      }
                    }}
                    rows={1}
                    maxRows={3}
                    {...field}
                    onChange={handleInputChange}
                    onClick={handleInputChange}
                    placeholder="Type a message..."
                    className="min-h-full w-full resize-none border-0 outline-0 bg-card text-card-foreground placeholder:text-muted-foreground p-1.5"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button disabled={pending} size="icon" type="submit">
            <SendHorizonal />
          </Button>
        </form>
      </Form>
    </div>
  </Card>
}

export default ChatInput