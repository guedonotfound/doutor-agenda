import { upsertPatient } from "@/actions/upsert-patient";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { PatternFormat } from "react-number-format";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  type UpsertPatientSchema,
  upsertPatientSchema,
} from "@/actions/upsert-patient/schema";

interface UpsertPatientFormProps {
  onSuccess?: () => void;
  defaultValues?: Partial<UpsertPatientSchema>;
}

export function UpsertPatientForm({
  onSuccess,
  defaultValues,
}: UpsertPatientFormProps) {
  const form = useForm<UpsertPatientSchema>({
    resolver: zodResolver(upsertPatientSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      sex: "male",
      ...defaultValues,
    },
  });

  const { execute, status } = useAction(upsertPatient, {
    onSuccess: () => {
      toast.success(
        defaultValues?.id
          ? "Paciente atualizado com sucesso!"
          : "Paciente cadastrado com sucesso!",
      );
      form.reset();
      onSuccess?.();
    },
    onError: ({ error }) => {
      if (error.serverError) {
        toast.error(error.serverError as string);
      }
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    execute(data);
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome</FormLabel>
              <FormControl>
                <Input placeholder="Nome do paciente" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="E-mail do paciente"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 items-center gap-4">
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefone</FormLabel>
                <FormControl>
                  <PatternFormat
                    format="(##) #####-####"
                    mask="_"
                    customInput={Input}
                    placeholder="(00) 00000-0000"
                    value={field.value}
                    onValueChange={(values) => {
                      field.onChange(values.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sex"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sexo</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o sexo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Feminino</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={status === "executing"}
        >
          {status === "executing"
            ? "Salvando..."
            : defaultValues?.id
              ? "Atualizar"
              : "Cadastrar"}
        </Button>
      </form>
    </Form>
  );
}
