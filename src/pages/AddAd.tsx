import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { useCreateListing, useCategories, useBrands, useStates, useCities, useDistricts } from '@/hooks/use-api';
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

export default function AddAd() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { data: categories } = useCategories();
  const { data: states } = useStates();
  const createListingMutation = useCreateListing();
  const { user } = useAuth();

  const autoSubmit = location.state?.autoSubmit;
  const savedFormData = location.state?.formData;

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
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [galleryImagePreviews, setGalleryImagePreviews] = useState<string[]>([]);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [lat, setLat] = useState<number | null>(null);
  const [lon, setLon] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: cities } = useCities(stateId);
  const { data: districts } = useDistricts(cityId);
  const { data: brands } = useBrands();

  const subCategories = categoryId && categories ?
    categories.find(cat => cat.id === categoryId)?.subcategories || [] : [];

  const childCategories = subCategoryId && subCategories ?
    subCategories.find(sub => sub.id === subCategoryId)?.childcategories || [] : [];

  useEffect(() => {
    return () => {
      if (mainImagePreview) URL.revokeObjectURL(mainImagePreview);
      galleryImagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [mainImagePreview, galleryImagePreviews]);

  useEffect(() => {
    if (savedFormData) {
      setAdType(savedFormData.adType);
      setCategoryId(savedFormData.categoryId);
      setSubCategoryId(savedFormData.subCategoryId);
      setChildCategoryId(savedFormData.childCategoryId);
      setBrandId(savedFormData.brandId);
      setAdTitle(savedFormData.adTitle);
      setAdDescription(savedFormData.adDescription);
      setAdPrice(savedFormData.adPrice);
      setIsNegotiable(savedFormData.isNegotiable);
      setStateId(savedFormData.stateId);
      setCityId(savedFormData.cityId);
      setDistrictId(savedFormData.districtId);
      setAddress(savedFormData.address);
      setPhoneHidden(savedFormData.phoneHidden);
      setProductCondition(savedFormData.productCondition);
      setMainImagePreview(savedFormData.mainImagePreview);
      setGalleryImagePreviews(savedFormData.galleryImagePreviews);
      setCurrentStep(4);
      setAgreeTerms(true);
    }
  }, [savedFormData]);

  useEffect(() => {
    if (autoSubmit && isAuthenticated() && savedFormData) {
      handlePublish();
    }
  }, [autoSubmit, savedFormData]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude);
          setLon(position.coords.longitude);
        },
        (error) => {
          console.error("Error getting geolocation:", error);
        }
      );
    }
  }, []);

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.match('image.*')) {
        setErrors({ ...errors, image: 'يجب أن يكون الملف صورة' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: 'حجم الصورة كبير جداً (الحد الأقصى 5MB)' });
        return;
      }
      setMainImage(file);
      setMainImagePreview(URL.createObjectURL(file));
      setErrors({ ...errors, image: '' });
    }
  };

  const handleGalleryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const invalidFiles = newFiles.filter(file => !file.type.match('image.*'));
      if (invalidFiles.length > 0) {
        setErrors({ ...errors, gallery_images: 'يجب أن تكون جميع الملفات صور' });
        return;
      }
      
      const largeFiles = newFiles.filter(file => file.size > 5 * 1024 * 1024);
      if (largeFiles.length > 0) {
        setErrors({ ...errors, gallery_images: 'بعض الصور كبيرة جداً (الحد الأقصى 5MB للصورة)' });
        return;
      }
      
      if (galleryImages.length + newFiles.length > 10) {
        setErrors({ ...errors, gallery_images: 'يمكنك تحميل 10 صور كحد أقصى' });
        return;
      }
      
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setGalleryImages([...galleryImages, ...newFiles]);
      setGalleryImagePreviews([...galleryImagePreviews, ...newPreviews]);
      setErrors({ ...errors, gallery_images: '' });
    }
  };

  const handleRemoveMainImage = () => {
    setMainImage(null);
    if (mainImagePreview) {
      URL.revokeObjectURL(mainImagePreview);
      setMainImagePreview(null);
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    const updatedImages = [...galleryImages];
    const updatedPreviews = [...galleryImagePreviews];
    if (galleryImagePreviews[index]) {
      URL.revokeObjectURL(galleryImagePreviews[index]);
    }
    updatedImages.splice(index, 1);
    updatedPreviews.splice(index, 1);
    setGalleryImages(updatedImages);
    setGalleryImagePreviews(updatedPreviews);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'اختر نوع الإعلان';
      case 2: return 'أضف معلومات الإعلان';
      case 3: return 'أضف الصور';
      case 4: return 'مراجعة نهائية';
      default: return '';
    }
  };

  const validateStep = useCallback((step: number) => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!categoryId) newErrors.category_id = 'التصنيف الرئيسي مطلوب';
    }
    if (step === 2) {
      if (!adTitle.trim()) {
        newErrors.title = 'عنوان الإعلان مطلوب';
      } else if (adTitle.length > 255) {
        newErrors.title = 'يجب ألا يتجاوز العنوان 255 حرفاً';
      } else {
        const titleCheck = checkProfanity(adTitle);
        if (!titleCheck.isClean) {
          newErrors.title = titleCheck.message || 'العنوان يحتوي على كلمات تخالف سياسة الموقع';
        }
      }
      if (!adDescription.trim()) {
        newErrors.description = 'وصف الإعلان مطلوب';
      } else if (adDescription.length > 2000) {
        newErrors.description = 'يجب ألا يتجاوز الوصف 2000 حرف';
      } else {
        const descriptionCheck = checkProfanity(adDescription);
        if (!descriptionCheck.isClean) {
          newErrors.description = descriptionCheck.message || 'الوصف يحتوي على كلمات تخالف سياسة الموقع';
        }
      }
      if (adType !== 'job') {
        if (!adPrice) {
          newErrors.price = 'السعر مطلوب';
        } else if (isNaN(Number(adPrice)) || Number(adPrice) < 0) {
          newErrors.price = 'الرجاء إدخال سعر صحيح (رقم موجب)';
        }
      }
      if (!stateId) newErrors.state_id = 'المحافظة مطلوبة';
      if (!cityId) newErrors.city_id = 'المنطقة مطلوبة';
      // الحي والعنوان التفصيلي أصبحا اختياريين
    }
    if (step === 3) {
      if (!mainImage) newErrors.image = 'الصورة الرئيسية مطلوبة';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [
    categoryId, adTitle, adDescription, adPrice, 
    stateId, cityId, adType, mainImage
  ]);

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
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
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };

  const handlePublish = async () => {
    const isStep1Valid = validateStep(1);
    const isStep2Valid = validateStep(2);
    const isStep3Valid = validateStep(3);

    if (!isStep1Valid || !isStep2Valid || !isStep3Valid) {
      toast({
        variant: 'destructive',
        title: 'معلومات غير مكتملة',
        description: 'يوجد أخطاء في بيانات الإعلان. يرجى مراجعة جميع الخطوات وتصحيح الأخطاء.',
      });
      if (!isStep1Valid) setCurrentStep(1);
      else if (!isStep2Valid) setCurrentStep(2);
      else if (!isStep3Valid) setCurrentStep(3);
      return;
    }

    if (!agreeTerms) {
      toast({
        variant: 'destructive',
        title: 'الموافقة على الشروط',
        description: 'يجب الموافقة على شروط الاستخدام وسياسة الخصوصية للمتابعة.',
      });
      return;
    }

    if (!isAuthenticated()) {
      const formData = {
        adType, categoryId, subCategoryId, childCategoryId, brandId, 
        adTitle, adDescription, adPrice, isNegotiable, stateId, 
        cityId, districtId, address, phoneHidden, productCondition, 
        mainImagePreview, galleryImagePreviews,
      };
      navigate('/auth/login', { state: { from: '/add-ad', formData } });
      return;
    }

    const formData = new FormData();
    formData.append('listing_type', adType);
    formData.append('category_id', categoryId!.toString());
    if (subCategoryId) formData.append('sub_category_id', subCategoryId.toString());
    if (childCategoryId) formData.append('child_category_id', childCategoryId.toString());
    if (brandId) formData.append('brand_id', brandId.toString());
    formData.append('title', adTitle.trim());
    formData.append('description', adDescription.trim());
    formData.append('price', adPrice || '0');
    formData.append('negotiable', isNegotiable ? '1' : '0');
    formData.append('state_id', stateId!.toString());
    formData.append('city_id', cityId!.toString());
    
    // الحي والعنوان التفصيلي أصبحا اختياريين
    if (districtId) formData.append('district_id', districtId.toString());
    if (address) formData.append('address', address.trim());
    
    formData.append('phone_hidden', phoneHidden ? '1' : '0');
    if (adType === 'sell' || adType === 'rent') {
      formData.append('condition', productCondition);
    }
    if (mainImage) {
      formData.append('image', mainImage);
    }
    galleryImages.forEach((image) => {
      formData.append('gallery_images[]', image);
    });
    if (lat !== null) formData.append('lat', lat.toString());
    if (lon !== null) formData.append('lon', lon.toString());

    try {
      await createListingMutation.mutateAsync(formData);
      // navigate('/dashboard', {
      //   state: { successMessage: 'تم نشر إعلانك بنجاح! وهو الآن قيد المراجعة.' }
      // });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'خطأ في نشر الإعلان',
        description: 'حدث خطأ أثناء محاولة نشر إعلانك. يرجى المحاولة مرة أخرى.',
      });
    }
  };

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
                      className={`text-sm font-medium ${step <= currentStep ? 'text-brand' : 'text-muted-foreground'
                        }`}
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
                      className={`p-6 border rounded-lg text-center hover:border-brand transition-colors ${adType === type.id ? 'border-brand bg-brand/5' : ''}`}
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
                          {subCategories.map((subCategory) => (
                            <SelectItem key={subCategory.id} value={subCategory.id.toString()}>
                              {subCategory.name}
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
                          {childCategories.map((childCategory) => (
                            <SelectItem key={childCategory.id} value={childCategory.id.toString()}>
                              {childCategory.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {(adType === 'sell' || adType === 'rent') && categoryId && brands && Array.isArray(brands) && brands.length > 0 && (
                    <div>
                      <Label>اختر الماركة (اختياري)</Label>
                      <Select value={brandId?.toString()} onValueChange={(value) => setBrandId(parseInt(value))}>
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
                <div className="flex justify-end pt-4">
                  <Button onClick={handleNextStep} disabled={!categoryId}>
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
                  {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
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
                  {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
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
                    {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
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
                        className={`p-3 border rounded-lg text-center ${productCondition === 'new' ? 'border-brand bg-brand/5' : ''}`}
                        onClick={() => setProductCondition('new')}
                      >
                        جديد
                      </button>
                      <button
                        type="button"
                        className={`p-3 border rounded-lg text-center ${productCondition === 'used' ? 'border-brand bg-brand/5' : ''}`}
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
                      <SelectTrigger id="state" className={`mt-1 ${errors.state_id ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder="اختر المحافظة" />
                      </SelectTrigger>
                      <SelectContent>
                        {states?.map((state) => (
                          <SelectItem key={state.id} value={state.id.toString()}>
                            {state.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.state_id && <p className="mt-1 text-sm text-red-500">{errors.state_id}</p>}
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
                      <SelectTrigger id="city" className={`mt-1 ${errors.city_id ? 'border-red-500' : ''}`}>
                        <SelectValue placeholder={stateId ? "اختر المنطقة" : "اختر المحافظة أولاً"} />
                      </SelectTrigger>
                      <SelectContent>
                        {cities?.map((city) => (
                          <SelectItem key={city.id} value={city.id.toString()}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.city_id && <p className="mt-1 text-sm text-red-500">{errors.city_id}</p>}
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
                      {districts?.map((district) => (
                        <SelectItem key={district.id} value={district.id.toString()}>
                          {district.name}
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
                    className={`mt-1`}
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
                    <Label htmlFor="phone-hidden">إخفاء رقم الهاتف (التواصل عبر الرسائل فقط)</Label>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={handlePrevStep}>السابق</Button>
                  <Button onClick={handleNextStep}>التالي</Button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <Label className="mb-2 block">الصورة الرئيسية</Label>
                  {mainImagePreview ? (
                    <div className="relative h-64 border rounded-lg overflow-hidden mb-4">
                      <img src={mainImagePreview} alt="الصورة الرئيسية" className="w-full h-full object-contain" />
                      <button
                        onClick={handleRemoveMainImage}
                        className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className={`relative h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 mb-4 ${errors.image ? 'border-red-500' : ''}`}>
                      <UploadCloud className="h-16 w-16 text-muted-foreground mb-2" />
                      <span className="text-muted-foreground mb-1">اضغط لإضافة الصورة الرئيسية</span>
                      <span className="text-xs text-muted-foreground">(مطلوب)</span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleMainImageChange}
                      />
                    </label>
                  )}
                  {errors.image && <p className="mt-1 text-sm text-red-500">{errors.image}</p>}

                  <Label className="mb-2 block">صور إضافية (اختياري)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    {galleryImagePreviews.map((image, index) => (
                      <div key={index} className="relative h-32 border rounded-lg overflow-hidden">
                        <img src={image} alt={`صورة ${index + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => handleRemoveGalleryImage(index)}
                          className="absolute top-1 left-1 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {galleryImagePreviews.length < 10 && (
                      <label className="relative h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                        <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">اضغط لإضافة صورة</span>
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
                  {errors.gallery_images && <p className="mt-1 text-sm text-red-500">{errors.gallery_images}</p>}

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
                  <Button variant="outline" onClick={handlePrevStep}>السابق</Button>
                  <Button onClick={handleNextStep} disabled={!mainImagePreview}>التالي</Button>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-gray-50 border-b p-3">
                    <h3 className="font-bold">مراجعة معلومات الإعلان</h3>
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
                            <img src={mainImagePreview} alt="الصورة الرئيسية" className="w-full h-full object-cover" />
                          </div>
                        )}
                        {galleryImagePreviews.map((image, index) => (
                          <div key={index} className="w-16 h-16 rounded-md overflow-hidden">
                            <img src={image} alt={`صورة ${index + 1}`} className="w-full h-full object-cover" />
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
                      أوافق على <a href="/terms" className="text-brand">شروط الاستخدام</a> و<a href="/privacy" className="text-brand">سياسة الخصوصية</a>
                    </label>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="default"
                      size="lg"
                      onClick={handlePublish}
                      disabled={createListingMutation.isPending || !agreeTerms}
                    >
                      {createListingMutation.isPending ? (
                        <>
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          جاري نشر الإعلان...
                        </>
                      ) : (
                        'نشر الإعلان'
                      )}
                    </Button>
                    <Button variant="outline" onClick={handlePrevStep}>تعديل الإعلان</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <MobileNav />
    </div>
  );
}