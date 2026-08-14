"use client";

import {
  useState,
  type ChangeEvent,
  type FormEvent,
  type HTMLInputTypeAttribute,
} from "react";
import Button from "@/components/button";
import { CONTACT } from "@/config/site";

/** One input in the form — rendered from data so the layout stays declarative. */
type Field = {
  id: "name" | "email" | "message";
  label: string;
  type: HTMLInputTypeAttribute | "textarea";
  autoComplete?: string;
};

/** The form's inputs. */
const FIELDS: Field[] = [
  { id: "name", label: "Your Name", type: "text", autoComplete: "name" },
  { id: "email", label: "Your Email", type: "email", autoComplete: "email" },
  { id: "message", label: "Message", type: "textarea" },
];

/** Label shown on the submit button. */
const SUBMIT_LABEL = "Send via WhatsApp";

/**
 * WhatsApp contact form — collects name, email and a message, then opens a
 * wa.me conversation with the business number (config/site.ts) prefilled.
 * Pure client component: nothing leaves the browser until the visitor sends
 * it from WhatsApp itself.
 */
export default function ContactForm() {
  const [values, setValues] = useState<Partial<Record<Field["id"], string>>>({});

  const handleChange =
    (id: Field["id"]) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((prev) => ({ ...prev, [id]: e.target.value }));

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const message = [
      `Name: ${values.name?.trim() ?? ""}`,
      `Email: ${values.email?.trim() ?? ""}`,
      "",
      values.message?.trim() ?? "",
    ].join("\n");
    const url = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="contact-form__fields">
        {FIELDS.map((field) => (
          <div className="field" key={field.id}>
            <label className="field__label" htmlFor={field.id}>
              {field.label}
            </label>
            {field.type === "textarea" ? (
              <textarea
                id={field.id}
                name={field.id}
                className="field__control field__control--textarea"
                rows={5}
                required
                value={values[field.id] ?? ""}
                onChange={handleChange(field.id)}
              />
            ) : (
              <input
                id={field.id}
                name={field.id}
                className="field__control"
                type={field.type}
                autoComplete={field.autoComplete}
                required
                value={values[field.id] ?? ""}
                onChange={handleChange(field.id)}
              />
            )}
          </div>
        ))}
      </div>
      <div className="contact-form__actions">
        <Button type="submit" variant="primary">
          {SUBMIT_LABEL}
        </Button>
      </div>
    </form>
  );
}
