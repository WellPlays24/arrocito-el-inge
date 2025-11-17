import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService, Product } from '../../core/product.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  errorMessage = '';

  showForm = false;
  saving = false;

  // Modo edición / creación
  editing = false;
  editingId: number | null = null;

  newProduct: Partial<Product> = {
    name: '',
    description: '',
    price: 0,
    category: '',
    is_active: true,
  };

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.loading = true;
    this.errorMessage = '';

    this.productService.getAll().subscribe({
      next: (data) => {
        this.products = data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Error al cargar productos';
        this.loading = false;
      },
    });
  }

  toggleForm() {
    // Si estamos editando y se da clic en "Cancelar", reseteamos
    if (this.showForm && this.editing) {
      this.editing = false;
      this.editingId = null;
    }

    this.showForm = !this.showForm;
    this.errorMessage = '';

    if (this.showForm && !this.editing) {
      // Nuevo producto
      this.newProduct = {
        name: '',
        description: '',
        price: 0,
        category: '',
        is_active: true,
      };
    }
  }

  // Crear o actualizar según el modo
  saveProduct() {
    if (!this.newProduct.name || this.newProduct.price == null) {
      this.errorMessage = 'Nombre y precio son obligatorios';
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    const payload: Partial<Product> = {
      name: this.newProduct.name,
      description: this.newProduct.description,
      price: this.newProduct.price,
      category: this.newProduct.category,
      is_active: this.newProduct.is_active ?? true,
    };

    if (this.editing && this.editingId !== null) {
      // Modo edición
      this.productService.update(this.editingId, payload).subscribe({
        next: (updated) => {
          // Reemplazar en el arreglo
          const index = this.products.findIndex((p) => p.id === updated.id);
          if (index !== -1) {
            this.products[index] = updated;
          }
          this.saving = false;
          this.showForm = false;
          this.editing = false;
          this.editingId = null;
        },
        error: () => {
          this.errorMessage = 'Error al actualizar producto';
          this.saving = false;
        },
      });
    } else {
      // Modo creación
      this.productService.create(payload).subscribe({
        next: (created) => {
          this.products.unshift(created);
          this.saving = false;
          this.showForm = false;
        },
        error: () => {
          this.errorMessage = 'Error al crear producto (¿estás logueado como admin?)';
          this.saving = false;
        },
      });
    }
  }

  // Cargar datos en el formulario para editar
  editProduct(product: Product) {
    this.editing = true;
    this.editingId = product.id;
    this.showForm = true;
    this.errorMessage = '';

    this.newProduct = {
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      is_active: product.is_active,
    };
  }

  // Eliminar producto
  deleteProduct(product: Product) {
    const ok = confirm(`¿Seguro que quieres eliminar "${product.name}"?`);
    if (!ok) return;

    this.productService.delete(product.id).subscribe({
      next: () => {
        this.products = this.products.filter((p) => p.id !== product.id);
      },
      error: () => {
        this.errorMessage = 'Error al eliminar producto';
      },
    });
  }
}
