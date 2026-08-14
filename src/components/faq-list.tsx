"use client";

import { useState } from "react";

export type FaqItem = {
  question: string;
  answer: string;
};

/**
 * FAQ accordion — click a question to reveal its answer. Items toggle
 * independently, and the answer animates open with a grid-template-rows
 * transition (no JS measuring). Standard disclosure pattern: each question
 * button carries aria-expanded + aria-controls, and closed answers are
 * hidden from the accessibility tree via `visibility`.
 */
export default function FaqList({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<Set<number>>(new Set());

  const toggle = (index: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  return (
    <ul className="faq__list">
      {items.map((item, index) => {
        const isOpen = open.has(index);
        return (
          <li
            key={item.question}
            className={`faq__item${isOpen ? " is-open" : ""}`}
          >
            <h3 className="faq__heading">
              <button
                id={`faq-question-${index}`}
                type="button"
                className="faq__question"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${index}`}
                onClick={() => toggle(index)}
              >
                <span className="faq__question-text">{item.question}</span>
                <span className="faq__toggle" aria-hidden="true">
                  +
                </span>
              </button>
            </h3>
            <div
              id={`faq-answer-${index}`}
              className="faq__answer-wrap"
            >
              <div className="faq__answer">
                <p>{item.answer}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
