import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertTriangle, AlertCircle, X } from 'lucide-react';
import { VerificationData } from '../EntrepreneurRegistration';

interface VerificationStepProps {
  data: VerificationData;
  onComplete: (data: VerificationData) => void;
  onBack: () => void;
}

export function VerificationStep({ data, onComplete, onBack }: VerificationStepProps) {
  const [formData, setFormData] = useState<VerificationData>(data);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  const validateFile = (file: File) => {
    if (!allowedTypes.includes(file.type)) {
      return 'Apenas arquivos PDF, JPG ou PNG são permitidos';
    }
    
    if (file.size > maxSize) {
      return 'Arquivo deve ter no máximo 5MB';
    }
    
    return null;
  };

  const handleFileSelect = (file: File) => {
    const error = validateFile(file);
    
    if (error) {
      setErrors(prev => ({ ...prev, document: error }));
      return;
    }
    
    setFormData(prev => ({ ...prev, document: file }));
    setErrors(prev => ({ ...prev, document: '' }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const removeFile = () => {
    setFormData(prev => ({ ...prev, document: null }));
    setErrors(prev => ({ ...prev, document: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') {
      return <FileText className="w-8 h-8 text-destructive" />;
    }
    return <FileText className="w-8 h-8 text-info" />;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.document) {
      newErrors.document = 'Comprovante de Inscrição é obrigatório';
    }
    
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Você deve aceitar o Termo de Responsabilidade';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onComplete(formData);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Verificação
        </h2>
        <p className="text-muted-foreground">
          Documentos e termos para finalizar seu cadastro
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Document Upload */}
        <div>
          <label className="block text-sm font-medium text-foreground/80 mb-2">
            Comprovante de Inscrição *
          </label>
          <p className="text-sm text-muted-foreground mb-4">
            Envie o Comprovante de Inscrição da sua empresa (PDF, JPG ou PNG - máx. 5MB)
          </p>
          
          {!formData.document ? (
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                dragActive 
                  ? 'border-primary bg-success-muted' 
                  : errors.document
                  ? 'border-destructive/40 bg-destructive-muted'
                  : 'border-input hover:border-foreground/40'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              
              <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground/80 mb-2">
                Clique para enviar ou arraste o arquivo aqui
              </p>
              <p className="text-sm text-muted-foreground">
                PDF, JPG ou PNG (máx. 5MB)
              </p>
            </div>
          ) : (
            <div className="border border-success/30 bg-success-muted rounded-lg p-4">
              <div className="flex items-center space-x-3">
                {getFileIcon(formData.document)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {formData.document.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatFileSize(formData.document.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
          
          {errors.document && (
            <div className="mt-1 flex items-center space-x-1 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{errors.document}</p>
            </div>
          )}
        </div>

        {/* Terms Acceptance */}
        <div className="bg-warning-muted border border-warning/30 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-warning mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-warning mb-2">
                Termo de Responsabilidade
              </h3>
              <div className="space-y-3">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={(e) => setFormData(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                    className={`w-4 h-4 text-primary border-input rounded focus:ring-ring mt-0.5 ${
                      errors.acceptTerms ? 'border-destructive' : ''
                    }`}
                  />
                  <span className="text-sm text-warning">
                    Declaro que sou o representante legal da loja informada e que os dados fornecidos são verdadeiros
                  </span>
                </label>
                
                <div className="bg-destructive-muted border border-destructive/30 rounded-md p-3">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    <p className="text-sm font-medium text-destructive">
                      O uso de marcas ou dados falsos resultará em bloqueio imediato e medidas legais.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {errors.acceptTerms && (
            <div className="mt-2 flex items-center space-x-1 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <p className="text-sm">{errors.acceptTerms}</p>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 bg-muted hover:bg-accent text-foreground/80 font-medium py-3 px-4 rounded-lg transition-all duration-200"
          >
            Voltar
          </button>
          <button
            type="submit"
            disabled={!formData.document || !formData.acceptTerms}
            className="flex-1 bg-primary hover:bg-primary-hover disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-primary-foreground font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:ring-4 focus:ring-ring/30"
          >
            Concluir Cadastro
          </button>
        </div>
      </form>
    </div>
  );
}