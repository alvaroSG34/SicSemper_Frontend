"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { listRegisterClubs, type RegisterClubOption } from "@/application/auth/auth.service";
import { participantService } from "@/application/participant/participant.service";
import type { ParticipantProfileDetails } from "@/domain/participant/participant.types";
import { Skeleton } from "@/presentation/components/ui";

const inputClassName =
  "h-11 w-full rounded-lg border border-[#2D2D2D] bg-[#101010] px-4 text-sm text-white outline-none transition-colors focus:border-[#5B68F1]";

const labelClassName = "text-sm font-semibold text-white";

const profileSchema = z.object({
  name: z.string().trim().min(1, "Tu nombre es obligatorio."),
  birthDate: z.string().optional(),
  ci: z.string().trim().max(60, "El CI es demasiado largo.").optional(),
  country: z.string().trim().max(120, "El pais es demasiado largo.").optional(),
  city: z.string().trim().max(120, "La ciudad es demasiado larga.").optional(),
  phone: z.string().trim().max(60, "El telefono es demasiado largo.").optional(),
  photoUrl: z.string().trim().min(1, "Debes subir una foto de perfil."),
  clubId: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

type UploadResponse = {
  url: string;
};

type UploadErrorResponse = {
  error?: string;
};

const defaultFormValues: ProfileFormValues = {
  name: "",
  birthDate: "",
  ci: "",
  country: "",
  city: "",
  phone: "",
  photoUrl: "",
  clubId: "",
};

type ParticipantProfilePanelProps = {
  onProfileUpdated?: () => void;
};

const toFormValues = (profile: ParticipantProfileDetails): ProfileFormValues => ({
  name: profile.name,
  birthDate: profile.birthDate,
  ci: profile.ci,
  country: profile.country,
  city: profile.city,
  phone: profile.phone,
  photoUrl: profile.photoUrl,
  clubId: profile.club?.id ?? "",
});

export function ParticipantProfilePanel({ onProfileUpdated }: ParticipantProfilePanelProps) {
  const [profile, setProfile] = useState<ParticipantProfileDetails | null>(null);
  const [clubs, setClubs] = useState<RegisterClubOption[]>([]);
  const [reloadToken, setReloadToken] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [clubsError, setClubsError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const photoFileInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: defaultFormValues,
  });

  const photoUrl = watch("photoUrl");

  const profileInitial = useMemo(() => {
    const source = profile?.name?.trim() ?? "";
    return source.charAt(0).toUpperCase() || "P";
  }, [profile?.name]);

  const clubOptions = useMemo(() => {
    if (!profile?.club) {
      return clubs;
    }

    if (clubs.some((club) => club.id === profile.club?.id)) {
      return clubs;
    }

    return [
      {
        id: profile.club.id,
        name: profile.club.name,
        place: profile.club.place,
      },
      ...clubs,
    ];
  }, [clubs, profile]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      setLoadError(null);
      setSuccessMessage(null);

      const [profileResult, clubsResult] = await Promise.allSettled([
        participantService.getProfile(),
        listRegisterClubs(),
      ]);

      if (!isMounted) {
        return;
      }

      if (profileResult.status === "rejected") {
        setLoadError(profileResult.reason instanceof Error ? profileResult.reason.message : "No se pudo cargar tu perfil.");
        setIsLoading(false);
        return;
      }

      setProfile(profileResult.value);
      reset(toFormValues(profileResult.value));

      if (clubsResult.status === "fulfilled") {
        setClubs(clubsResult.value);
        setClubsError(null);
      } else {
        setClubs([]);
        setClubsError("No pudimos cargar la lista de clubes.");
      }

      setIsLoading(false);
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [reset, reloadToken]);

  const handlePhotoFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsPhotoUploading(true);
    setLoadError(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/profile-photo", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let message = "No se pudo subir la foto de perfil.";
        try {
          const data = (await response.json()) as UploadErrorResponse;
          if (data.error) {
            message = data.error;
          }
        } catch {
          // Keep fallback error
        }

        setLoadError(message);
        return;
      }

      const data = (await response.json()) as UploadResponse;
      if (!data.url) {
        setLoadError("No se pudo obtener la URL de la foto subida.");
        return;
      }

      setValue("photoUrl", data.url, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    } catch {
      setLoadError("No se pudo subir la foto de perfil.");
    } finally {
      setIsPhotoUploading(false);
      if (photoFileInputRef.current) {
        photoFileInputRef.current.value = "";
      }
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    setIsSaving(true);
    setLoadError(null);
    setSuccessMessage(null);

    try {
      const updatedProfile = await participantService.updateProfile({
        name: values.name.trim(),
        birthDate: values.birthDate || null,
        ci: values.ci?.trim() || null,
        country: values.country?.trim() || null,
        city: values.city?.trim() || null,
        phone: values.phone?.trim() || null,
        photoUrl: values.photoUrl.trim() || null,
        clubId: values.clubId || null,
      });

      setProfile(updatedProfile);
      reset(toFormValues(updatedProfile));
      setSuccessMessage("Tu perfil fue actualizado correctamente.");
      onProfileUpdated?.();
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "No se pudo actualizar tu perfil.");
    } finally {
      setIsSaving(false);
    }
  });

  if (isLoading && !profile) {
    return (
      <section className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-6 sm:p-8">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[#242424] bg-[#111111] px-4 py-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-4 w-36" />
          </div>
          <div className="rounded-2xl border border-[#242424] bg-[#111111] px-4 py-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-4 w-32" />
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Skeleton className="h-4 w-32 md:col-span-2" />
          <Skeleton className="h-16 w-full md:col-span-2" />
          <Skeleton className="h-4 w-32 md:col-span-2" />
          <Skeleton className="h-11 w-full md:col-span-2" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-10 w-44" />
        </div>
      </section>
    );
  }

  if (loadError && !profile) {
    return (
      <section className="rounded-3xl border border-[#ef4444]/40 bg-[#7f1d1d]/20 p-6">
        <p className="text-sm text-[#fca5a5]">{loadError}</p>
        <button
          type="button"
          onClick={() => {
            setProfile(null);
            setIsLoading(true);
            setLoadError(null);
            setSuccessMessage(null);
            setReloadToken((current) => current + 1);
          }}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-lg border border-[#fca5a5]/40 px-4 text-sm font-semibold text-[#fca5a5]"
        >
          Recargar
        </button>
      </section>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-[#2D2D2D] bg-[#161616] p-6 sm:p-8">
      <div className="flex flex-col gap-2">
        <h3 className="text-2xl font-semibold text-white">Mi Perfil</h3>
        <p className="text-sm text-[#9C9C9C]">
          Manten tus datos actualizados para facilitar tus inscripciones y tu participacion.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[#242424] bg-[#111111] px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-[#7B7B7B]">Correo</p>
          <p className="mt-2 text-sm text-white">{profile.email}</p>
        </div>
        <div className="rounded-2xl border border-[#242424] bg-[#111111] px-4 py-3">
          <p className="text-xs uppercase tracking-[0.18em] text-[#7B7B7B]">Estado</p>
          <p className="mt-2 text-sm text-white">
            {profile.status} {profile.verified ? "- Verificado" : "- Pendiente"}
          </p>
        </div>
      </div>

      {loadError ? (
        <div className="mt-6 rounded-xl border border-[#ef4444]/40 bg-[#7f1d1d]/20 px-4 py-3 text-sm text-[#fca5a5]">
          {loadError}
        </div>
      ) : null}

      {successMessage ? (
        <div className="mt-6 rounded-xl border border-[#22c55e]/30 bg-[#14532d]/20 px-4 py-3 text-sm text-[#86efac]">
          {successMessage}
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="mt-6 grid gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className={labelClassName}>Foto de perfil *</label>
          <div className="flex flex-col gap-4 rounded-xl border border-[#2D2D2D] bg-[#101010] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 overflow-hidden rounded-full border border-[#2D2D2D] bg-[#151515]">
                {photoUrl ? (
                  <Image
                    src={photoUrl}
                    alt="Foto de perfil"
                    width={64}
                    height={64}
                    sizes="64px"
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-[#9C9C9C]">
                    {profileInitial}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-sm text-white">{photoUrl ? "Foto cargada" : "Sin foto de perfil"}</p>
                <p className="text-xs text-[#9C9C9C]">Formatos JPG, PNG o WEBP. Maximo 2 MB.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => photoFileInputRef.current?.click()}
              disabled={isPhotoUploading || isSaving}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-[#5B68F1]/50 px-4 text-sm font-semibold text-[#C9D0FF] transition-colors hover:border-[#5B68F1] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPhotoUploading ? "Subiendo..." : photoUrl ? "Cambiar foto" : "Subir foto"}
            </button>
          </div>

          <input type="hidden" {...register("photoUrl")} />
          <input
            ref={photoFileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handlePhotoFileChange}
          />
          {errors.photoUrl ? <p className="text-xs text-[#fca5a5]">{errors.photoUrl.message}</p> : null}
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <label htmlFor="profile-name" className={labelClassName}>
            Nombre completo
          </label>
          <input id="profile-name" className={inputClassName} {...register("name")} />
          {errors.name ? <p className="text-xs text-[#fca5a5]">{errors.name.message}</p> : null}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="profile-ci" className={labelClassName}>
            C.I.
          </label>
          <input id="profile-ci" className={inputClassName} inputMode="numeric" {...register("ci")} />
          {errors.ci ? <p className="text-xs text-[#fca5a5]">{errors.ci.message}</p> : null}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="profile-birthDate" className={labelClassName}>
            Fecha de nacimiento
          </label>
          <input id="profile-birthDate" type="date" className={inputClassName} {...register("birthDate")} />
          {errors.birthDate ? <p className="text-xs text-[#fca5a5]">{errors.birthDate.message}</p> : null}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="profile-country" className={labelClassName}>
            Pais
          </label>
          <input id="profile-country" className={inputClassName} {...register("country")} />
          {errors.country ? <p className="text-xs text-[#fca5a5]">{errors.country.message}</p> : null}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="profile-city" className={labelClassName}>
            Ciudad
          </label>
          <input id="profile-city" className={inputClassName} {...register("city")} />
          {errors.city ? <p className="text-xs text-[#fca5a5]">{errors.city.message}</p> : null}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="profile-phone" className={labelClassName}>
            Telefono
          </label>
          <input id="profile-phone" className={inputClassName} inputMode="tel" {...register("phone")} />
          {errors.phone ? <p className="text-xs text-[#fca5a5]">{errors.phone.message}</p> : null}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="profile-clubId" className={labelClassName}>
            Club
          </label>
          <select id="profile-clubId" className={inputClassName} {...register("clubId")}>
            <option value="">Sin club</option>
            {clubOptions.map((club) => (
              <option key={club.id} value={club.id}>
                {club.name} - {club.place}
              </option>
            ))}
          </select>
          {clubsError ? <p className="text-xs text-[#fca5a5]">{clubsError}</p> : null}
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-white">Ultima actualizacion</p>
          <div className="rounded-lg border border-[#2D2D2D] bg-[#101010] px-4 py-3 text-sm text-[#CFCFCF]">
            {new Date(profile.updatedAt).toLocaleString()}
          </div>
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={isSaving || isPhotoUploading || !isDirty}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#5B68F1] px-5 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </section>
  );
}
