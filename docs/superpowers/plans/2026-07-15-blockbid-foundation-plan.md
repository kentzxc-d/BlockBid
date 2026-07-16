# BlockBid Evolution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the existing hash-logging `BlockBid.sol` contract into a full self-sustaining escrow system with Stablecoins (`BlockBidToken`) and KYC Badges (`VerifiedBadge`), integrating with the existing Next.js + Privy + Supabase stack.

**Architecture:** 
1. The Smart Contracts will live in the existing `contracts/` Hardhat workspace.
2. The Webhook API will be added to the existing `web/app/api/` Next.js directory.
3. The frontend uses `viem` and `@privy-io/react-auth` to interact with these contracts.

**Tech Stack:** Solidity (Hardhat), Next.js (App Router), Viem, Privy, Supabase.

## Global Constraints
- Contracts must be placed in `contracts/contracts/`
- Tests must be placed in `contracts/test/`
- Use Solidity ^0.8.20
- Follow the existing TDD process (write tests first)

---

### Task 1: BlockBid Stablecoin (ERC20)

**Files:**
- Create: `contracts/contracts/BlockBidToken.sol`
- Create: `contracts/test/BlockBidToken.test.ts`

**Interfaces:**
- Produces: `mint(address to, uint256 amount)` callable only by owner.

- [ ] **Step 1: Write the failing test**

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";

describe("BlockBidToken", function () {
  it("Should mint tokens if called by owner", async function () {
    const [owner, user] = await ethers.getSigners();
    const Token = await ethers.getContractFactory("BlockBidToken");
    const token = await Token.deploy();
    
    await token.mint(user.address, 1000);
    expect(await token.balanceOf(user.address)).to.equal(1000);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx hardhat test test/BlockBidToken.test.ts` (inside `contracts/` directory)
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BlockBidToken is ERC20, Ownable {
    constructor() ERC20("BlockBid Token", "PHPB") Ownable(msg.sender) {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx hardhat test test/BlockBidToken.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add contracts/contracts/BlockBidToken.sol contracts/test/BlockBidToken.test.ts
git commit -m "feat: implement BlockBid Stablecoin"
```

### Task 2: Verified Identity Badge (Soulbound Token)

**Files:**
- Create: `contracts/contracts/VerifiedBadge.sol`
- Create: `contracts/test/VerifiedBadge.test.ts`

**Interfaces:**
- Produces: `mintBadge(address to)`, `revokeBadge(uint256 tokenId)`

- [ ] **Step 1: Write the failing test**

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";

describe("VerifiedBadge", function () {
  it("Should mint a non-transferable badge", async function () {
    const [owner, user, anotherUser] = await ethers.getSigners();
    const Badge = await ethers.getContractFactory("VerifiedBadge");
    const badge = await Badge.deploy();
    
    await badge.mintBadge(user.address);
    expect(await badge.balanceOf(user.address)).to.equal(1);
    
    await expect(
      badge.connect(user).transferFrom(user.address, anotherUser.address, 0)
    ).to.be.revertedWith("VerifiedBadge: Non-transferable");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx hardhat test test/VerifiedBadge.test.ts`
Expected: FAIL

- [ ] **Step 3: Write minimal implementation**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VerifiedBadge is ERC721, Ownable {
    uint256 private _nextTokenId;

    constructor() ERC721("Verified Badge", "VB") Ownable(msg.sender) {}

    function mintBadge(address to) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
    }

    function revokeBadge(uint256 tokenId) public onlyOwner {
        _burn(tokenId);
    }

    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        require(from == address(0) || to == address(0), "VerifiedBadge: Non-transferable");
        return super._update(to, tokenId, auth);
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx hardhat test test/VerifiedBadge.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add contracts/contracts/VerifiedBadge.sol contracts/test/VerifiedBadge.test.ts
git commit -m "feat: implement Soulbound KYC Badge"
```

### Task 3: Upgrade BlockBid.sol (Add Deposit/Escrow Logic)

**Files:**
- Modify: `contracts/contracts/BlockBid.sol`

**Interfaces:**
- Consumes: `BlockBidToken` (for checking balances and transferring deposits)

- [ ] **Step 1: Modify existing implementation**
*(Note: TDD is recommended here, but the core task is to upgrade the existing contract to accept Stablecoins as a deposit fee instead of just logging hashes).*

Modify `contracts/contracts/BlockBid.sol` to include a constructor that takes the `BlockBidToken` address, and add a `depositAndCommitBid` function that transfers the deposit from the user to the contract before emitting the `BidCommitted` event.

### Task 4: PayMongo Webhook API Endpoint

**Files:**
- Create: `web/app/api/webhooks/paymongo/route.ts`

**Interfaces:**
- Consumes: Next.js API standard
- Produces: `POST /api/webhooks/paymongo`

- [ ] **Step 1: Write minimal implementation**

```typescript
// web/app/api/webhooks/paymongo/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate PayMongo Signature here in production
    
    if (body.data?.attributes?.type === "source.chargeable") {
      // Setup Viem client here to call BlockBidToken.mint on the backend
      return NextResponse.json({ success: true, message: "Webhook received" });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add web/app/api/webhooks/paymongo/route.ts
git commit -m "feat: add PayMongo webhook endpoint"
```
