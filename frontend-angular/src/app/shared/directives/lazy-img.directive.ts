import { Directive, ElementRef, Input, OnInit, Renderer2, HostBinding, OnDestroy } from '@angular/core';

@Directive({
  selector: 'img[appLazyImg]',
  standalone: true
})
export class LazyImgDirective implements OnInit, OnDestroy {
  @Input() appLazyImg!: string;
  @Input() placeholderSrc = 'assets/images/placeholder.svg';

  private observer: IntersectionObserver | null = null;
  private loaded = false;

  @HostBinding('attr.src') srcAttr = this.placeholderSrc;
  @HostBinding('class.lazy-loading') get isLoading() { return !this.loaded; }
  @HostBinding('class.lazy-loaded') get isLoaded() { return this.loaded; }

  constructor(
    private el: ElementRef<HTMLImageElement>,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    this.srcAttr = this.placeholderSrc;

    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.loadImage();

            if (this.observer) {
              this.observer.disconnect();
              this.observer = null;
            }
            break;
          }
        }}, {
        rootMargin: '100px',
        threshold: 0.1
      });

      this.observer.observe(this.el.nativeElement);
    } else {
      this.loadImage();
    }
  }

  private loadImage(): void {
    const img = new Image();

    img.onload = () => {
      this.renderer.setAttribute(this.el.nativeElement, 'src', this.appLazyImg);
      this.srcAttr = this.appLazyImg;
      this.loaded = true;
      this.renderer.addClass(this.el.nativeElement, 'fade-in');
    };

    img.onerror = () => {
      console.error(`Error loading image: ${this.appLazyImg}`);
    };

    img.src = this.appLazyImg;
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}
