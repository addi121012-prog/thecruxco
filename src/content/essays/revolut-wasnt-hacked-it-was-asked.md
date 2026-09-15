---
title: "Revolut wasn't hacked. Someone just asked — as the government."
pubDate: 2026-09-15
author: "The Crux"
excerpt: "A fintech with 80 million customers handed over passports and financial records to an attacker who simply emailed from a real government domain and asked. The break-in that worked this week didn't break anything."
tags: ["cybersecurity", "fintech", "trending"]
draft: false
---

The most valuable break-in of the week involved breaking nothing. Someone emailed Revolut, claimed to be a government agency, and the company handed over customers' passports.

## What happened

Revolut, the fintech that serves more than 80 million customers, confirmed this week that an unauthorised third party obtained sensitive customer data — not by hacking its servers, but by impersonating a government agency. According to the company's statement to TechCrunch, the attacker used "a legitimate government agency domain email to submit fraudulent requests for information," and Revolut fulfilled them.

The exposed data, per Revolut and multiple outlets covering the disclosure, included names, dates of birth, addresses, phone numbers, and identity documents such as passports and driver's licenses — with reporting suggesting verification selfies, account statements, and transaction histories may also have been swept up. Revolut says only a "limited" number of customers were affected but declined to give a figure or name the agency that was impersonated. Its own line is unambiguous on one point: "Revolut systems and customer funds are unaffected." The company blocked the fraudulent address and notified customers, regulators, and law enforcement.

Read that carefully. Nothing was cracked. The front door was the compliance inbox.

## Why it matters

Every large platform — banks, fintechs, social networks, telecoms — runs a channel for governments and police to request user data. It is built to be fast and cooperative, because a real law-enforcement demand carries legal weight and refusing one has consequences. Often the request arrives as an email from an official-looking domain, and the data flows. That is the design, not a bug.

The Revolut attack didn't defeat encryption. It defeated a human process engineered to say yes. And it isn't novel: fake "emergency data request" scams have hit Apple, Meta, and Discord in prior years. What's new is the target. This has now reached regulated finance, where the payload isn't a username but a passport scan and a full transaction history — the exact kit an identity thief needs.

For India, the exposure is structural, not hypothetical. Indian platforms field enormous volumes of government and police data requests, frequently over email, under the IT Act and the newer data-protection regime. The channel is the same, the trust assumption is the same, and the verification standards for who is actually on the other end are still being written.

## The crux

The reflex after any breach is "spend more on security." Here that instinct points at the wrong wall. Revolut's systems worked as designed; the safeguard that failed was the check on *who was asking*. The government-request channel is a permanent, trusted back door that platforms are legally required to keep open — and its security is only as strong as their ability to verify a requester's identity. You cannot firewall it shut.

That produces an uncomfortable law: the more legitimate a channel is, the more attractive it is to fake, because everyone has been trained to comply with it quickly and without friction. The safest-looking door is the one worth knocking on.

## What to take away

Two things.

First, as a customer: the lesson is not "switch to a more secure app." Your identity documents — passport, selfie, statements — already live in dozens of places you uploaded them to, and any one of those can be talked into handing them over. Minimise where you submit documents, and treat every unexpected "verify your identity" prompt as guilty until proven innocent.

Second, if you run a platform: the data-request channel deserves the same adversarial scrutiny as your login page. A domain that looks right is not authentication. Out-of-band callbacks, verified official portals, and cryptographic signing of requests are the floor, not the extra.

The strongest lock in the building was guarding a door the company is legally required to leave unlocked. So the thief didn't pick it. He knocked, and gave the right name.
