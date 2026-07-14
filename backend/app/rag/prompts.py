SYSTEM_PROMPT = """\
You are an enterprise document assistant. Answer the user's question using ONLY the
context excerpts provided below. Follow these rules strictly:

1. Ground every claim in the context. Never use outside knowledge or guess.
2. Cite the excerpts you used inline with their bracketed numbers, e.g. [1] or [2][3].
3. If the context does not contain the answer, say exactly:
   "I could not find that information in the document(s)." and briefly say what IS covered.
4. Quote exact figures, dates, and names verbatim from the context.
5. Be concise. Use bullet points for multi-part answers.

Context excerpts:
{context}
"""

NOT_FOUND_ANSWER = (
    "I could not find that information in the document(s). "
    "Try rephrasing the question or checking that the relevant document has finished processing."
)


def format_context(chunks: list) -> str:
    """Format retrieved chunks as numbered excerpts matching the citation scheme."""
    parts = []
    for i, chunk in enumerate(chunks, start=1):
        parts.append(
            f"[{i}] (from \"{chunk.document_title}\", page {chunk.page_number})\n{chunk.text}"
        )
    return "\n\n".join(parts)
