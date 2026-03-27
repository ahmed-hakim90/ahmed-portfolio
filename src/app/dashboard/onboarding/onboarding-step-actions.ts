export type RegisteredOnboardingStepActions =
  | { kind: "form"; save: () => void; skip: () => void }
  | { kind: "done"; finish: () => void };

export type RegisterOnboardingStepActionsFn = (
  actions: RegisteredOnboardingStepActions | null,
) => void;
