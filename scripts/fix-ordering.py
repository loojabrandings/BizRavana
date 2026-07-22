import sys

with open("src/app/(dashboard)/dashboard/orders/page.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# Find the dispatch state declarations
state_start = content.find("  // ─── Dispatch Dialog State")
state_end = content.find("  // ─── Fetch full order", state_start)
if state_start < 0 or state_end < 0:
    print("ERROR: Could not find dispatch state section")
    sys.exit(1)

dispatch_state = content[state_start:state_end]

# Find where to insert - before the first use (handleStatusChange)
insert_point = content.find("  // ─── Mutations ─────────────────────────────────────────────────")

if insert_point < 0:
    print("ERROR: Could not find Mutations section")
    sys.exit(1)

# Remove the dispatch state from its current location
content = content[:state_start] + content[state_end:]

# Insert the dispatch state just before the Mutations section
content = content[:insert_point] + dispatch_state + "\n\n" + content[insert_point:]

with open("src/app/(dashboard)/dashboard/orders/page.tsx", "w", encoding="utf-8") as f:
    f.write(content)

print("SUCCESS: Dispatch state moved before handleStatusChange")
