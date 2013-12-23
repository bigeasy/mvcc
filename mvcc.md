Every time a process performs an operation on a given key in some temporary
tree, Strata actually modifies that key, creating a "composite" key using its
original value and the version number. Thus, each key in a tree is
differentiated from the same key in other trees by its version; they are no
longer the same key at all, and gain chronological (relatively, at least)
information in addition to positional/relational information. Multiple processes
can operate on multiple keys without conflicting in this manner, since each
process is isolated to its own tree.

Multi-version concurrency control (MVCC) is a way of managing concurrency, in
this case for b-trees in Strata. The idea is to design an algorithm that
protects the tree from concurrent writes which are possible because only the
relevant page is locked when performing an operation. When two or more processes
wish to operate on the same page, an order of operation is decided by each
process being marked with a numeric version, the greatest of which taking
precedence in the case processes finish in an order inconsistent with their
starting order.

When a process is given a version  number and performs an operation, it is
actually performed on a temporary tree. Strata will then compare version numbers
for each key, and update the primary tree with the latest version's changes for
a given key. Deletions work the same way, except instead of removing the record
from the temporary tree, it is simply flagged and skipped during the final
merge. Reads are unrestricted by this implementation - even on a key a process
is operating on - because the primary tree is not affected until the algorithm
has completed; i.e., there is no reason a read operation should have to wait
unless the read occurs on the same page at the moment Strata locks it to apply a
merge.

I think "versioned concurrency control" would be a better name; if not, then a
name without the word "version" in it at all. "Multi-version" sounds like
compatibility, porting, etc; "versioned" sounds like stages or states, and the
multiplicity is implied.
