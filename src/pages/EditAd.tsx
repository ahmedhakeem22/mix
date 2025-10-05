import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, Image, X, UploadCloud, ChevronDown, Info, Loader2 } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MobileNav } from '@/components/layout/mobile-nav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { isAuthenticated } from '@/services/api';
import { useUpdateListing, useListing, useCategories, useBrands, useStates, useCities, useDistricts } from '@/hooks/use-api';
import { checkProfanity } from '@/utils/profanity-filter';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface GalleryImage {
  id: string;
  url: string;
}

interface MainImage {
  id: string;
  url: string;
}

export default function EditAd() {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const listingIdNumber = useMemo(() => {
    const id = Number(listingId);
    return isNaN(id) ? -1 : id;
  }, [listingId]);

  const { 
    data: listing, 
    isLoading: isLoadingListing, 
    error: listingError 
  } = useListing(listingIdNumber);

  const { data: categories } = useCategories();
  const { data: states } = useStates();
  const updateListingMutation = useUpdateListing(listingIdNumber);

  const [currentStep, setCurrentStep] = useState(1);
  const [adType, setAdType] = useState<'sell' | 'rent' | 'job' | 'service'>('sell');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [subCategoryId, setSubCategoryId] = useState<number | null>(null);
  const [childCategoryId, setChildCategoryId] = useState<number | null>(null);
  const [brandId, setBrandId] = useState<number | null>(null);
  const [adTitle, setAdTitle] = useState('');
  const [adDescription, setAdDescription] = useState('');
  const [adPrice, setAdPrice] = useState('');
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [stateId, setStateId] = useState<number | null>(null);
  const [cityId, setCityId] = useState<number | null>(null);
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [address, setAddress] = useState('');
  const [phoneHidden, setPhoneHidden] = useState(false);
  const [productCondition, setProductCondition] = useState<'new' | 'used'>('used');

  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [existingMainImage, setExistingMainImage] = useState<MainImage | null>(null);

  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [galleryImagePreviews, setGalleryImagePreviews] = useState<string[]>([]);
  const [existingGalleryImages, setExistingGalleryImages] = useState<GalleryImage[]>([]);
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([]);

  const [agreeTerms, setAgreeTerms] = useState(true);
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  const { data: cities } = useCities(stateId);
  const { data: districts } = useDistricts(cityId);
  const { data: brands } = useBrands();

  const subCategories = useMemo(() => {
    return categoryId && categories 
      ? categories.find(cat => cat.id === categoryId)?.subcategories || [] 
      : [];
  }, [categoryId, categories]);

  const childCategories = useMemo(() => {
    return subCategoryId && subCategories 
      ? subCategories.find(sub => sub.id === subCategoryId)?.childcategories || [] 
      : [];
  }, [subCategoryId, subCategories]);

  useEffect(() => {
    if (!isAuthenticated()) {
      toast({ 
        variant: 'destructive', 
        title: 'تسجيل الدخول مطلوب',
        description: 'يجب تسجيل الدخول لتعديل الإعلانات'
      });
      navigate('/auth/login', { state: { from: `/edit-ad/${listingId}` } });
      return;
    }

    if (listingIdNumber <= 0) {
      toast({ 
        variant: 'destructive', 
        title: 'معرف غير صالح',
        description: 'معرف الإعلان غير صحيح'
      });
      navigate('/dashboard');
      return;
    }

    if (listingError) {
      toast({ 
        variant: 'destructive', 
        title: 'خطأ في تحميل البيانات',
        description: 'لم نتمكن من تحميل بيانات الإعلان'
      });
      navigate('/dashboard');
    }
  }, [listingError, listingId, listingIdNumber, navigate, toast]);

  useEffect(() => {
    if (listing && !isInitialized) {
      setAdType(listing.listing_type as 'sell' | 'rent' | 'job' | 'service' || 'sell');
      setCategoryId(listing.category_id || null);
      setSubCategoryId(typeof listing.sub_category_id === 'number' ? listing.sub_category_id : null);
      setChildCategoryId(typeof listing.child_category_id === 'number' ? listing.child_category_id : null);
      setBrandId(listing.brand_id || null);
      setAdTitle(listing.title || '');
      setAdDescription(listing.description || '');
      setAdPrice(listing.price ? String(listing.price) : '');
      setIsNegotiable(listing.negotiable || false);
      setStateId(listing.state_id || null);
      setCityId(listing.city_id || null);
      setDistrictId(listing.district_id || null);
      setAddress(listing.address || '');
      setPhoneHidden(listing.phone_hidden || false);
      setProductCondition(listing.condition as 'new' | 'used' || 'used');
      setLat(listing.lat ? Number(listing.lat) : null);
      setLon(listing.lon ? Number(listing.lon) : null);

      if (listing.image && typeof listing.image === 'object') {
        setExistingMainImage({ 
          id: (listing.image as any).image_id || (listing.image as any).id, 
          url: (listing.image as any).image_url || (listing.image as any).url 
        });
      }
      
      if (listing.images && Array.isArray(listing.images)) {
        setExistingGalleryImages(listing.images.map(img => {
          if (typeof img === 'object') {
            return { 
              id: (img as any).id || (img as any).image_id, 
              url: (img as any).url || (img as any).image_url 
            };
          }
          return { id: '', url: '' };
        }).filter(img => img.id && img.url));
      }

      setIsInitialized(true);
    }
  }, [listing, isInitialized]);

  useEffect(() => {
    return () => {
      if (mainImagePreview) URL.revokeObjectURL(mainImagePreview);
      galleryImagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [mainImagePreview, galleryImagePreviews]);

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    
    const file = e.target.files[0];
    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, image: 'يجب أن يكون الملف صورة' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, image: 'حجم الصورة كبير جداً (الحد الأقصى 5MB)' });
      return;
    }
    
    setMainImage(file);
    if (mainImagePreview) URL.revokeObjectURL(mainImagePreview);
    setMainImagePreview(URL.createObjectURL(file));
    setErrors({ ...errors, image: '' });
  };

  const handleRemoveMainImage = () => {
    if (mainImage && mainImagePreview) {
      URL.revokeObjectURL(mainImagePreview);
      setMainImage(null);
      setMainImagePreview(null);
    } else if (existingMainImage) {
      setDeletedImageIds(prev => [...prev, existingMainImage.id]);
      setExistingMainImage(null);
    }
  };

  const handleGalleryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const newFiles = Array.from(e.target.files);
    const validFiles = newFiles.filter(file => 
      file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024
    );
    
    if (validFiles.length !== newFiles.length) {
      toast({
        variant: 'destructive',
        title: 'ملفات غير صالحة',
        description: 'بعض الملفات ليست صوراً أو حجمها كبير جداً'
      });
    }
    
    const totalImages = existingGalleryImages.length + galleryImages.length + validFiles.length;
    if (totalImages > 10) {
      toast({
        variant: 'destructive',
        title: 'الحد الأقصى للصور',
        description: 'لا يمكن إضافة أكثر من 10 صور'
      });
      return;
    }
    
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setGalleryImages(prev => [...prev, ...validFiles]);
    setGalleryImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const handleRemoveNewGalleryImage = (index: number) => {
    if (galleryImagePreviews[index]) {
      URL.revokeObjectURL(galleryImagePreviews[index]);
    }
    
    const newImages = [...galleryImages];
    const newPreviews = [...galleryImagePreviews];
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setGalleryImages(newImages);
    setGalleryImagePreviews(newPreviews);
  };

  const handleRemoveExistingGalleryImage = (id: string) => {
    setDeletedImageIds(prev => [...prev, id]);
    setExistingGalleryImages(prev => prev.filter(img => img.id !== id));
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'تعديل نوع الإعلان';
      case 2: return 'تعديل معلومات الإعلان';
      case 3: return 'تعديل الصور';
      case 4: return 'مراجعة وحفظ التعديلات';
      default: return '';
    }
  };

  const validateStep = useCallback((step: number) => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!categoryId) newErrors.category_id = 'التصنيف الرئيسي مطلوب';
    }
    
    if (step === 2) {
      // Title validation
      if (!adTitle.trim()) {
        newErrors.title = 'عنوان الإعلان مطلوب';
      } else if (adTitle.length > 255) {
        newErrors.title = 'يجب ألا يتجاوز العنوان 255 حرفاً';
      } else {
        const titleCheck = checkProfanity(adTitle);
        if (!titleCheck.isClean) {
          newErrors.title = titleCheck.message || 'العنوان يحتوي على كلمات مخالفة';
        }
      }
      
      // Description validation
      if (!adDescription.trim()) {
        newErrors.description = 'وصف الإعلان مطلوب';
      } else if (adDescription.length > 2000) {
        newErrors.description = 'يجب ألا يتجاوز الوصف 2000 حرف';
      } else {
        const descriptionCheck = checkProfanity(adDescription);
        if (!descriptionCheck.isClean) {
          newErrors.description = descriptionCheck.message || 'الوصف يحتوي على كلمات مخالفة';
        }
      }
      
      // Price validation (only for sell/rent)
      if (adType !== 'job') {
        if (!adPrice) {
          newErrors.price = 'السعر مطلوب';
        } else if (isNaN(Number(adPrice)) || Number(adPrice) < 0) {
          newErrors.price = 'الرجاء إدخال سعر صحيح (رقم موجب)';
        }
      }
      
      // Location validation
      if (!stateId) newErrors.state_id = 'المحافظة مطلوبة';
      if (!cityId) newErrors.city_id = 'المنطقة مطلوبة';
      
      // District and address are now optional (no validation)
    }
    
    if (step === 3) {
      if (!mainImage && !existingMainImage) newErrors.image = 'الصورة الرئيسية مطلوبة';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [
    categoryId, adTitle, adDescription, adPrice, 
    stateId, cityId, adType, mainImage, existingMainImage
  ]);

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(4, prev + 1));
      window.scrollTo(0, 0);
    } else {
      toast({
        variant: 'destructive',
        title: 'حقول مطلوبة',
        description: 'يرجى مراجعة الحقول المظللة بالأحمر وتعبئتها.',
      });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
    window.scrollTo(0, 0);
  };

  const handleUpdate = async () => {
    // Validate all steps
    const step1Valid = validateStep(1);
    const step2Valid = validateStep(2);
    const step3Valid = validateStep(3);

    if (!step1Valid || !step2Valid || !step3Valid) {
      toast({
        variant: 'destructive',
        title: 'معلومات غير مكتملة',
        description: 'يوجد أخطاء في بيانات الإعلان. يرجى مراجعة جميع الخطوات وتصحيح الأخطاء.',
      });
      
      if (!step1Valid) setCurrentStep(1);
      else if (!step2Valid) setCurrentStep(2);
      else if (!step3Valid) setCurrentStep(3);
      return;
    }
    
    if (!agreeTerms) {
      toast({ 
        variant: 'destructive', 
        title: 'الموافقة على الشروط مطلوبة',
        description: 'يجب الموافقة على الشروط والأحكام للمتابعة'
      });
      return;
    }

    const formData = new FormData();
    formData.append('_method', 'PUT');
    formData.append('listing_type', adType);
    formData.append('category_id', categoryId!.toString());
    formData.append('title', adTitle.trim());
    formData.append('description', adDescription.trim());
    formData.append('price', adPrice || '0');
    formData.append('state_id', stateId!.toString());
    formData.append('city_id', cityId!.toString());
    
    // Optional fields
    if (districtId) formData.append('district_id', districtId.toString());
    if (address) formData.append('address', address.trim());
    
    if (subCategoryId) formData.append('sub_category_id', subCategoryId.toString());
    if (childCategoryId) formData.append('child_category_id', childCategoryId.toString());
    if (brandId) formData.append('brand_id', brandId.toString());
    
    formData.append('negotiable', isNegotiable ? '1' : '0');
    formData.append('phone_hidden', phoneHidden ? '1' : '0');
    
    if (adType === 'sell' || adType === 'rent') {
      formData.append('condition', productCondition);
    }
    
    if (lat !== null) formData.append('lat', lat.toString());
    if (lon !== null) formData.append('lon', lon.toString());
    
    if (mainImage) formData.append('image', mainImage);
    
    galleryImages.forEach(file => formData.append('gallery_images[]', file));
    deletedImageIds.forEach(id => formData.append('deleted_images[]', id));

    try {
      await updateListingMutation.mutateAsync(formData);
      navigate('/dashboard', { 
        state: { 
          successMessage: 'تم تحديث الإعلان بنجاح.',
          successIcon: 'success'
        } 
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'خطأ في التحديث',
        description: 'حدث خطأ أثناء محاولة تحديث الإعلان. يرجى المحاولة مرة أخرى.',
      });
    }
  };

  const confirmDelete = async () => {
    const deleteFormData = new FormData();
    deleteFormData.append('_method', 'DELETE');
    
    try {
      await updateListingMutation.mutateAsync(deleteFormData);
      setIsDeleteDialogOpen(false);
      navigate('/dashboard', { 
        state: { 
          successMessage: 'تم حذف الإعلان بنجاح.',
          successIcon: 'success'
        } 
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'خطأ في الحذف',
        description: 'حدث خطأ أثناء محاولة حذف الإعلان. يرجى المحاولة مرة أخرى.',
      });
    }
  };

  if (isLoadingListing || !isInitialized) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-brand" />
            <h2 className="text-xl font-medium">جاري تحميل بيانات الإعلان...</h2>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-20 md:pb-0">
        <div className="container px-4 mx-auto py-6">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-6 text-center">{getStepTitle()}</h1>
              <div className="relative">
                <div className="flex justify-between mb-2">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`text-sm font-medium ${step <= currentStep ? 'text-brand' : 'text-muted-foreground'}`}
                    >
                      الخطوة {step}
                    </div>
                  ))}
                </div>
                <div className="overflow-hidden h-2 rounded-full bg-gray-200">
                  <div
                    className="h-full bg-brand transition-all duration-300"
                    style={{ width: `${(currentStep / 4) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: 'sell', label: 'بيع منتج' },
                    { id: 'rent', label: 'تأجير' },
                    { id: 'job', label: 'وظيفة' },
                    { id: 'service', label: 'خدمة' }
                  ].map((type) => (
                    <button
                      key={type.id}
                      className={`p-6 border rounded-lg text-center hover:border-brand transition-colors ${
                        adType === type.id ? 'border-brand bg-brand/5' : ''
                      }`}
                      onClick={() => setAdType(type.id as any)}
                    >
                      <div className="text-lg font-bold">{type.label}</div>
                    </button>
                  ))}
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>اختر التصنيف الرئيسي</Label>
                    <Select
                      value={categoryId?.toString()}
                      onValueChange={(value) => {
                        setCategoryId(parseInt(value));
                        setSubCategoryId(null);
                        setChildCategoryId(null);
                        setBrandId(null);
                        setErrors({ ...errors, category_id: '' });
                      }}
                    >
                      <SelectTrigger className={errors.category_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder="اختر التصنيف الرئيسي" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category_id && (
                      <p className="mt-1 text-sm text-red-500">{errors.category_id}</p>
                    )}
                  </div>
                  
                  {categoryId && subCategories.length > 0 && (
                    <div>
                      <Label>اختر التصنيف الفرعي</Label>
                      <Select
                        value={subCategoryId?.toString()}
                        onValueChange={(value) => {
                          setSubCategoryId(parseInt(value));
                          setChildCategoryId(null);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر التصنيف الفرعي" />
                        </SelectTrigger>
                        <SelectContent>
                          {subCategories.map((sub) => (
                            <SelectItem key={sub.id} value={sub.id.toString()}>
                              {sub.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {subCategoryId && childCategories.length > 0 && (
                    <div>
                      <Label>اختر التصنيف التفصيلي</Label>
                      <Select
                        value={childCategoryId?.toString()}
                        onValueChange={(value) => setChildCategoryId(parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر التصنيف التفصيلي" />
                        </SelectTrigger>
                        <SelectContent>
                          {childCategories.map((child) => (
                            <SelectItem key={child.id} value={child.id.toString()}>
                              {child.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {(adType === 'sell' || adType === 'rent') && 
                    categoryId && 
                    brands && 
                    Array.isArray(brands) && 
                    brands.length > 0 && (
                    <div>
                      <Label>اختر الماركة (اختياري)</Label>
                      <Select 
                        value={brandId?.toString()} 
                        onValueChange={(value) => setBrandId(parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الماركة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">بدون ماركة</SelectItem>
                          {brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id.toString()}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep(4)}>
                    العودة للمراجعة
                  </Button>
                  <Button onClick={handleNextStep}>
                    التالي
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="title">عنوان الإعلان</Label>
                  <Input
                    id="title"
                    value={adTitle}
                    onChange={(e) => {
                      setAdTitle(e.target.value);
                      if (errors.title) setErrors({ ...errors, title: '' });
                    }}
                    placeholder="اكتب عنواناً واضحاً ومختصراً"
                    className={`mt-1 ${errors.title ? 'border-red-500' : ''}`}
                  />
                  <p className="mt-1 text-sm text-muted-foreground">
                    {adTitle.length}/255 حرف
                  </p>
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="description">وصف الإعلان</Label>
                  <Textarea
                    id="description"
                    value={adDescription}
                    onChange={(e) => {
                      setAdDescription(e.target.value);
                      if (errors.description) setErrors({ ...errors, description: '' });
                    }}
                    placeholder="اكتب وصفاً مفصلاً"
                    rows={5}
                    className={`mt-1 resize-none ${errors.description ? 'border-red-500' : ''}`}
                  />
                  <p className="mt-1 text-sm text-muted-foreground">
                    {adDescription.length}/2000 حرف
                  </p>
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">السعر (SYP)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={adPrice}
                      onChange={(e) => {
                        setAdPrice(e.target.value);
                        if (errors.price) setErrors({ ...errors, price: '' });
                      }}
                      placeholder="أدخل السعر"
                      className={`mt-1 ${errors.price ? 'border-red-500' : ''}`}
                      disabled={adType === 'job'}
                    />
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-500">{errors.price}</p>
                    )}
                  </div>
                  
                  <div>
                    <div className="h-8" />
                    <div className="flex items-center space-x-2 space-x-reverse mt-1">
                      <Switch
                        id="negotiable"
                        checked={isNegotiable}
                        onCheckedChange={setIsNegotiable}
                        disabled={adType === 'job'}
                      />
                      <Label htmlFor="negotiable">السعر قابل للتفاوض</Label>
                    </div>
                  </div>
                </div>
                
                {(adType === 'sell' || adType === 'rent') && (
                  <div>
                    <Label htmlFor="condition">حالة المنتج</Label>
                    <div className="grid grid-cols-2 gap-4 mt-1">
                      <button
                        type="button"
                        className={`p-3 border rounded-lg text-center ${
                          productCondition === 'new' ? 'border-brand bg-brand/5' : ''
                        }`}
                        onClick={() => setProductCondition('new')}
                      >
                        جديد
                      </button>
                      <button
                        type="button"
                        className={`p-3 border rounded-lg text-center ${
                          productCondition === 'used' ? 'border-brand bg-brand/5' : ''
                        }`}
                        onClick={() => setProductCondition('used')}
                      >
                        مستعمل
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="state">المحافظة</Label>
                    <Select
                      value={stateId?.toString()}
                      onValueChange={(value) => {
                        setStateId(parseInt(value));
                        setCityId(null);
                        setDistrictId(null);
                        setErrors({ ...errors, state_id: '', city_id: '', district_id: '' });
                      }}
                    >
                      <SelectTrigger 
                        id="state" 
                        className={`mt-1 ${errors.state_id ? 'border-red-500' : ''}`}
                      >
                        <SelectValue placeholder="اختر المحافظة" />
                      </SelectTrigger>
                      <SelectContent>
                        {states?.map((s) => (
                          <SelectItem key={s.id} value={s.id.toString()}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.state_id && (
                      <p className="mt-1 text-sm text-red-500">{errors.state_id}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="city">المنطقة</Label>
                    <Select
                      value={cityId?.toString()}
                      onValueChange={(value) => {
                        setCityId(parseInt(value));
                        setDistrictId(null);
                        setErrors({ ...errors, city_id: '', district_id: '' });
                      }}
                      disabled={!stateId}
                    >
                      <SelectTrigger 
                        id="city" 
                        className={`mt-1 ${errors.city_id ? 'border-red-500' : ''}`}
                      >
                        <SelectValue placeholder={stateId ? "اختر المدينة" : "اختر المحافظة أولاً"} />
                      </SelectTrigger>
                      <SelectContent>
                        {cities?.map((c) => (
                          <SelectItem key={c.id} value={c.id.toString()}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.city_id && (
                      <p className="mt-1 text-sm text-red-500">{errors.city_id}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="district">الحي (اختياري)</Label>
                  <Select
                    value={districtId?.toString()}
                    onValueChange={(value) => {
                      setDistrictId(parseInt(value));
                      if (errors.district_id) setErrors({ ...errors, district_id: '' });
                    }}
                    disabled={!cityId}
                  >
                    <SelectTrigger id="district">
                      <SelectValue placeholder={cityId ? "اختر الحي" : "اختر المنطقة أولاً"} />
                    </SelectTrigger>
                    <SelectContent>
                      {districts?.map((d) => (
                        <SelectItem key={d.id} value={d.id.toString()}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="address">العنوان التفصيلي (اختياري)</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (errors.address) setErrors({ ...errors, address: '' });
                    }}
                    placeholder="أدخل العنوان التفصيلي"
                    className="mt-1"
                  />
                </div>
                
                <div className="pt-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="contact-settings">معلومات الاتصال</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Info className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>يمكنك التحكم في كيفية ظهور معلومات الاتصال الخاصة بك</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse mt-1">
                    <Switch
                      id="phone-hidden"
                      checked={phoneHidden}
                      onCheckedChange={setPhoneHidden}
                    />
                    <Label htmlFor="phone-hidden">
                      إخفاء رقم الهاتف (التواصل عبر الرسائل فقط)
                    </Label>
                  </div>
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handlePrevStep}>
                    السابق
                  </Button>
                  <Button onClick={handleNextStep}>
                    التالي
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <Label className="mb-2 block">الصورة الرئيسية</Label>
                  {mainImagePreview ? (
                    <div className="relative h-64 border rounded-lg overflow-hidden mb-4">
                      <img 
                        src={mainImagePreview} 
                        alt="معاينة الصورة الرئيسية" 
                        className="w-full h-full object-contain" 
                      />
                      <button
                        onClick={handleRemoveMainImage}
                        className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : existingMainImage ? (
                    <div className="relative h-64 border rounded-lg overflow-hidden mb-4">
                      <img 
                        src={existingMainImage.url} 
                        alt="الصورة الرئيسية الحالية" 
                        className="w-full h-full object-contain" 
                      />
                      <button
                        onClick={handleRemoveMainImage}
                        className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label 
                      className={`relative h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 mb-4 ${
                        errors.image ? 'border-red-500' : ''
                      }`}
                    >
                      <UploadCloud className="h-16 w-16 text-muted-foreground mb-2" />
                      <span className="text-muted-foreground mb-1">
                        اضغط لإضافة الصورة الرئيسية
                      </span>
                      <span className="text-xs text-muted-foreground">(مطلوب)</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleMainImageChange}
                      />
                    </label>
                  )}
                  {errors.image && (
                    <p className="mt-1 text-sm text-red-500">{errors.image}</p>
                  )}

                  <Label className="mb-2 block">صور إضافية (اختياري)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    {existingGalleryImages.map((image) => (
                      <div key={image.id} className="relative h-32 border rounded-lg overflow-hidden">
                        <img 
                          src={image.url} 
                          alt={`صورة حالية`} 
                          className="w-full h-full object-cover" 
                        />
                        <button
                          onClick={() => handleRemoveExistingGalleryImage(image.id)}
                          className="absolute top-1 left-1 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    
                    {galleryImagePreviews.map((preview, index) => (
                      <div key={index} className="relative h-32 border rounded-lg overflow-hidden">
                        <img 
                          src={preview} 
                          alt={`صورة جديدة ${index + 1}`} 
                          className="w-full h-full object-cover" 
                        />
                        <button
                          onClick={() => handleRemoveNewGalleryImage(index)}
                          className="absolute top-1 left-1 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    
                    {(existingGalleryImages.length + galleryImages.length) < 10 && (
                      <label className="relative h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                        <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">
                          اضغط لإضافة صورة
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleGalleryImageChange}
                          multiple
                        />
                      </label>
                    )}
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-700 text-sm">
                    <div className="flex items-start">
                      <Info className="h-5 w-5 ml-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold mb-1">نصائح لصور أفضل:</p>
                        <ul className="list-disc pr-5">
                          <li>استخدم صوراً واضحة وبجودة عالية</li>
                          <li>أضف صوراً من زوايا مختلفة</li>
                          <li>تأكد من إضاءة جيدة للصور</li>
                          <li>تجنب استخدام شعارات أو نصوص على الصور</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handlePrevStep}>
                    السابق
                  </Button>
                  <Button 
                    onClick={handleNextStep} 
                    disabled={!mainImage && !existingMainImage}
                  >
                    التالي
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 border-b p-3 flex justify-between items-center">
                    <h3 className="font-bold">مراجعة معلومات الإعلان</h3>
                    <Button 
                      variant="link" 
                      onClick={() => setCurrentStep(1)}
                      className="text-brand"
                    >
                      تعديل الأقسام
                    </Button>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm text-muted-foreground">عنوان الإعلان</h4>
                        <p>{adTitle}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm text-muted-foreground">التصنيف</h4>
                        <p>{categories?.find(c => c.id === categoryId)?.name || '-'}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm text-muted-foreground">المحافظة</h4>
                        <p>{states?.find(s => s.id === stateId)?.name || '-'}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm text-muted-foreground">المنطقة</h4>
                        <p>{cities?.find(c => c.id === cityId)?.name || '-'}</p>
                      </div>
                      
                      {districtId && (
                        <div>
                          <h4 className="text-sm text-muted-foreground">الحي</h4>
                          <p>{districts?.find(d => d.id === districtId)?.name || '-'}</p>
                        </div>
                      )}
                      
                      {address && (
                        <div>
                          <h4 className="text-sm text-muted-foreground">العنوان التفصيلي</h4>
                          <p>{address}</p>
                        </div>
                      )}
                      
                      <div>
                        <h4 className="text-sm text-muted-foreground">السعر</h4>
                        <p>
                          {adPrice ? `${adPrice} SYP` : '-'}
                          {isNegotiable && adPrice && ' (قابل للتفاوض)'}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm text-muted-foreground">نوع الإعلان</h4>
                        <p>
                          {adType === 'sell' && 'بيع منتج'}
                          {adType === 'rent' && 'تأجير'}
                          {adType === 'job' && 'وظيفة'}
                          {adType === 'service' && 'خدمة'}
                        </p>
                      </div>
                      
                      {(adType === 'sell' || adType === 'rent') && (
                        <div>
                          <h4 className="text-sm text-muted-foreground">حالة المنتج</h4>
                          <p>{productCondition === 'new' ? 'جديد' : 'مستعمل'}</p>
                        </div>
                      )}
                      
                      {brandId && brandId > 0 && brands && Array.isArray(brands) && (
                        <div>
                          <h4 className="text-sm text-muted-foreground">الماركة</h4>
                          <p>{brands.find(b => b.id === brandId)?.name || '-'}</p>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="text-sm text-muted-foreground">الوصف</h4>
                      <p className="whitespace-pre-line">{adDescription}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm text-muted-foreground">الصور</h4>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {mainImagePreview && (
                          <div className="w-16 h-16 rounded-md overflow-hidden border-2 border-brand">
                            <img 
                              src={mainImagePreview} 
                              alt="الصورة الرئيسية" 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        )}
                        
                        {!mainImagePreview && existingMainImage && (
                          <div className="w-16 h-16 rounded-md overflow-hidden border-2 border-brand">
                            <img 
                              src={existingMainImage.url} 
                              alt="الصورة الرئيسية" 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        )}
                        
                        {existingGalleryImages.map((image) => (
                          <div key={image.id} className="w-16 h-16 rounded-md overflow-hidden">
                            <img 
                              src={image.url} 
                              alt={`صورة`} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        ))}
                        
                        {galleryImagePreviews.map((preview, index) => (
                          <div key={index} className="w-16 h-16 rounded-md overflow-hidden">
                            <img 
                              src={preview} 
                              alt={`صورة جديدة ${index + 1}`} 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm text-muted-foreground">معلومات الاتصال</h4>
                      <p>{phoneHidden ? 'رقم الهاتف مخفي' : 'رقم الهاتف مرئي للجميع'}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center space-x-2 space-x-reverse mb-4">
                    <input
                      type="checkbox"
                      id="terms"
                      className="rounded border-gray-300"
                      checked={agreeTerms}
                      onChange={() => setAgreeTerms(!agreeTerms)}
                    />
                    <label htmlFor="terms" className="text-sm">
                      أوافق على <a href="/terms" className="text-brand">شروط الاستخدام</a> و
                      <a href="/privacy" className="text-brand">سياسة الخصوصية</a>
                    </label>
                  </div>
                  
                  <div className="grid gap-2">
                    <Button
                      variant="default"
                      size="lg"
                      onClick={handleUpdate}
                      disabled={updateListingMutation.isPending || !agreeTerms}
                    >
                      {updateListingMutation.isPending ? (
                        <>
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          جاري حفظ التعديلات...
                        </>
                      ) : (
                        'حفظ التعديلات'
                      )}
                    </Button>
                    
                    <Button 
                      variant="destructive" 
                      onClick={() => setIsDeleteDialogOpen(true)}
                    >
                      <X className="h-4 w-4 ml-1" />
                      حذف الإعلان
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد حذف الإعلان</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من رغبتك في حذف هذا الإعلان؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete} 
              className="bg-red-600 hover:bg-red-700"
            >
              نعم، قم بالحذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Footer />
      <MobileNav />
    </div>
  );
}