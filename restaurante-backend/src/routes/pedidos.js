import express from "express"
import { prisma } from "../config/db.js"

const router = express.Router()
console.log("ENTRO AL POST /PEDIDOS")


//Listar pedidos por estado GET /pedidos?estado=PENDIENTE
router.get("/listar", async (req, res) => {
  const { estado } = req.query

  const pedidos = await prisma.pedido.findMany({
    where: estado ? { estado } : {},
    include: {
      mesa: true,
      items: {
        include: { producto: true }
      }
    },
    orderBy: { creado: "asc" }
  })

  res.json(pedidos)
})

// Obtener todos los combos activos
router.get("/combos", async (req, res) => {
  const combos = await prisma.combo.findMany({
    where: { activo: true },
    include: {
      items: { include: { producto: true } }
    }
  })

  res.json(combos)
})

//Ver combo por ID
router.get("/combos/:id", async (req, res) => {
  const id = Number(req.params.id)

  const combo = await prisma.combo.findUnique({
    where: { id },
    include: {
      items: { include: { producto: true } }
    }
  })

  if (!combo) {
    return res.status(404).json({ error: "Combo no encontrado" })
  }

  res.json(combo)
})

//Ver pedidos activos por mesa GET /mesas/:id/pedidos-activos
router.get("/mesas/:id/pedidos-activos", async (req, res) => {
  const mesaId = Number(req.params.id)

  const pedidos = await prisma.pedido.findMany({
    where: {
      mesaId,
      estado: {
        in: ["PENDIENTE", "PREPARACION", "LISTO"]
      }
    },
    include: {
      items: { include: { producto: true } }
    }
  })

  res.json(pedidos)
})

router.get("/mesas/:id/pedido-actual", async (req, res) => {
  console.log("ENTRÓ A pedido-actual", req.params.id)
    const mesaId = Number(req.params.id)

  const pedido = await prisma.pedido.findFirst({
    where: {
      mesaId,
      estado: {
        in: ["PENDIENTE", "PREPARACION"]
      }
    },
    orderBy: { creado: "desc" },
    include: {
      items: { include: { producto: true } }
    }
  })

  if (!pedido) {
    return res.status(404).json({ error: "No hay pedido activo" })
  }

  res.json(pedido)
})

// Agregar producto a pedido
router.post("/:id/items", async (req, res) => {
  try {
    const pedidoId = Number(req.params.id)
    const { productoId, cantidad } = req.body

    const producto = await prisma.producto.findUnique({
      where: { id: productoId }
    })

    if (!producto || !producto.activo) {
      return res.status(400).json({ error: "Producto no disponible" })
    }

    const item = await prisma.itemPedido.upsert({
      where: {
        pedidoId_productoId: {
          pedidoId,
          productoId
        }
      },
      update: {
        cantidad: { increment: cantidad }
      },
      create: {
        pedidoId,
        productoId,
        cantidad
      }
    })

    res.json(item)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Error agregando producto" })
  }
})


// Obtener el costo totla a pagar GET /pedidos/:id/total
router.get("/:id/total", async (req, res) => {
  try {
    const pedidoId = Number(req.params.id)

    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      include: {
        items: {
          include: { producto: true }
        }
      }
    })

    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" })
    }

    const total = pedido.items.reduce(
      (sum, item) => sum + item.cantidad * item.producto.precio,
      0
    )

    res.json({
      pedidoId: pedido.id,
      total,
      items: pedido.items
    })

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Error calculando total" })
  }
})




// Cambiar estado del pedido : PATCH /pedidos/:id/estado
//{ "estado": "PREPARACION" }


router.patch("/:id/estado", async (req, res) => {
  try {
    const pedidoId = Number(req.params.id)
    const { estado } = req.body

    if (estado === "PREPARACION") {
      const enPreparacion = await prisma.pedido.count({
        where: { estado: "PREPARACION" }
      })

      if (enPreparacion >= 2) {
        return res.status(400).json({
          error: "Ya hay 2 pedidos en preparación"
        })
      }
    }

    const pedido = await prisma.pedido.update({
      where: { id: pedidoId },
      data: { estado }
    })

    res.json(pedido)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Error actualizando estado" })
  }
})

//Cancelacion de pedidos PATCH /pedidos/:id/cancelar

router.patch("/:id/cancelar", async (req, res) => {
  const pedidoId = Number(req.params.id)

  const pedido = await prisma.pedido.update({
    where: { id: pedidoId },
    data: { estado: "CANCELADO" }
  })

  res.json(pedido)
})

// GET /pedidos/pagados
router.get("/pagados", async (req, res) => {
  try {
    const pedidos = await prisma.pedido.findMany({
      where: {
        estado: "PAGADO"  // solo pedidos pagados
      },
      include: {
        mesa: true,
        items: {
          include: {
            producto: true
          }
        }
      },
      orderBy: {
        pagadoEn: "desc" // opcional, ordena del más reciente al más antiguo
      }
    });

    res.json(pedidos);
  } catch (error) {
    console.error("Error obteniendo pedidos pagados:", error);
    res.status(500).json({ error: "Error obteniendo pedidos pagados" });
  }
});

router.patch("/:id/pagar", async (req, res) => {
  try {
    const pedidoId = Number(req.params.id);
    const { metodoPago } = req.body;

    if (!metodoPago) {
      return res.status(400).json({ error: "Método de pago requerido" });
    }
    const aux = new Date()
    const now = new Date(aux.getTime() - aux.getTimezoneOffset() * 60000)
    const pedido = await prisma.pedido.update({
      where: { id: pedidoId },
      data: {
        estado: "PAGADO",
        metodoPago,
        pagadoEn: now
      }
    });

    res.json(pedido);

  } catch (error) {
    console.error("Error al pagar pedido:", error);
    res.status(500).json({ error: "Error al pagar pedido" });
  }
});

// GET /mesas
router.get("/mesas", async (req, res) => {
  try {
    const mesas = await prisma.mesa.findMany({
      orderBy: { numero: "asc" }, // opcional, para que vengan ordenadas
    });

    // Devuelve solo el id y número
    res.json(mesas.map(m => ({ id: m.id, numero: m.numero })));
  } catch (error) {
    console.error("Error obteniendo mesas:", error);
    res.status(500).json({ error: "Error obteniendo mesas" });
  }
});

router.get("/all", async (req, res) => {
  const productos = await prisma.producto.findMany({
    where: { activo: true }
  })
  res.json(productos)
})

router.get("/:id/view", async (req, res) => {
  const id = Number(req.params.id)

  const producto = await prisma.producto.findUnique({
    where: { id }
  })

  if (!producto) {
    return res.status(404).json({ error: "Producto no encontrado" })
  }

  res.json(producto)
})

router.post("/nuevoProducto", async (req, res) => {
  try {
    const { nombre, precio } = req.body

    if (!nombre || !precio) {
      return res.status(400).json({ error: "Datos incompletos" })
    }

    const producto = await prisma.producto.create({
      data: {
        nombre,
        precio,
        activo: true
      }
    })

    res.status(201).json(producto)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Error creando producto" })
  }
})

router.patch("/:id/actualizar", async (req, res) => {
  try {
    const id = Number(req.params.id)
    const { nombre, precio, activo } = req.body

    const producto = await prisma.producto.update({
      where: { id },
      data: { nombre, precio, activo }
    })

    res.json(producto)
  } catch (error) {
    res.status(500).json({ error: "Error actualizando producto" })
  }
})


router.post("/:id/combo", async (req, res) => {
  try {
    const pedidoId = Number(req.params.id)
    const { comboId } = req.body

    const combo = await prisma.combo.findUnique({
      where: { id: comboId },
      include: { items: true }
    })

    if (!combo || !combo.activo) {
      return res.status(400).json({ error: "Combo no disponible" })
    }

    for (const item of combo.items) {
      await prisma.itemPedido.upsert({
        where: {
          pedidoId_productoId: {
            pedidoId,
            productoId: item.productoId
          }
        },
        update: {
          cantidad: { increment: item.cantidad }
        },
        create: {
          pedidoId,
          productoId: item.productoId,
          cantidad: item.cantidad
        }
      })
    }

    res.json({ message: "Combo agregado al pedido" })

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Error agregando combo" })
  }
})


// GET /productos
router.get("/", async (req, res) => {
  const productos = await prisma.producto.findMany({
    where: { activo: true }
  })

  res.json(productos)
})

router.post("/", async (req, res) => {
  try {
    const { mesaId, items } = req.body
    console.log("BODY:", req.body)
    if (!mesaId || !items || items.length === 0) {
      
      return res.status(400).json({ error: "Pedido incompleto" })
    }

    // validar mesa
    const mesa = await prisma.mesa.findUnique({
      where: { id: mesaId }
    })

    if (!mesa) {
      return res.status(400).json({ error: "Mesa inválida" })
    }

    // 🔴 VALIDAR PEDIDO ACTIVO
    const pedidoActivo = await prisma.pedido.findFirst({
      where: {
        mesaId,
        estado: {
          in: ["PENDIENTE", "PREPARACION"]
        }
      },
      orderBy: { creado: "desc" }
    })

    if (pedidoActivo) {
      return res.status(400).json({
        error: "La mesa ya tiene un pedido activo"
      })
    }

    // validar productos
    const productos = await prisma.producto.findMany({
      where: {
        id: { in: items.map(i => i.productoId) },
        activo: true
      }
    })

    if (productos.length !== items.length) {
      return res.status(400).json({ error: "Producto inválido o inactivo" })
    }

    // crear pedido + items
    const pedido = await prisma.pedido.create({
      data: {
        mesaId,
        estado: "PENDIENTE",
        items: {
          create: items.map(item => ({
            productoId: item.productoId,
            cantidad: item.cantidad
          }))
        }
      },
      include: {
        items: { include: { producto: true } },
        mesa: true
      }
    })

    res.status(201).json(pedido)

  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Error creando pedido" })
  }
})

router.get("/listos", async (req, res) => {
  try {
    const pedidos = await prisma.pedido.findMany({
      where: {
        estado: "LISTO"
      },
      include: {
        items: {
          include: {
            producto: true
          }
        }
      }
    });

    res.json(pedidos);

  } catch (error) {
    console.error("Error al obtener pedidos listos:", error);
    res.status(500).json({ error: "Error al obtener pedidos listos" });
  }
});

// GET /pedidos/activos
router.get("/activos", async (req, res) => {
  try {
    const pedidos = await prisma.pedido.findMany({
      where: {
        estado: {
          in: ["PENDIENTE", "PREPARACION", "LISTO"]
        }
      },
      include: {
        mesa: true,
        items: {
          include: {
            producto: true
          }
        }
      },
      orderBy: {
        creado: "desc"
      }
    })

    res.json(pedidos)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Error obteniendo pedidos activos" })
  }
})


router.put("/:id", async (req, res) => {
  const pedidoId = Number(req.params.id)
  const { items } = req.body

  try {
    // 1. Obtener pedido anterior
    const pedidoAnterior = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      include: { items: true }
    })

    // Map: productoId -> cantidad
    const mapaAnterior = new Map()
    pedidoAnterior.items.forEach(i => mapaAnterior.set(i.productoId, i.cantidad))

    // 2. Verificar si algún producto aumentó
    let cambiarEstado = false
    for (const i of items) {
      const cantidadAnterior = mapaAnterior.get(i.productoId) || 0
      if (i.cantidad > cantidadAnterior) {
        cambiarEstado = true
        break
      }
    }

    // 3. Borrar items anteriores
    await prisma.itemPedido.deleteMany({
      where: { pedidoId }
    })

    // 4. Actualizar pedido
    const pedidoActualizado = await prisma.pedido.update({
      where: { id: pedidoId },
      data: {
        estado: cambiarEstado ? "PREPARACION" : pedidoAnterior.estado,
        items: {
          create: items.map(i => ({
            productoId: i.productoId,
            cantidad: i.cantidad
          }))
        }
      },
      include: {
        items: { include: { producto: true } }
      }
    })

    res.json({
      pedido: pedidoActualizado,
      cambiarEstado
    })

  } catch (e) {
    console.error(e)
    res.status(500).json({ error: "Error actualizando pedido" })
  }
})

// Ver pedido completo
router.get("/:id", async (req, res) => {
  const pedidoId = Number(req.params.id)

  const pedido = await prisma.pedido.findUnique({
    where: { id: pedidoId },
    include: {
      mesa: true,
      items: {
        include: { producto: true }
      }
    }
  })

  if (!pedido) {
    return res.status(404).json({ error: "Pedido no encontrado" })
  }

  res.json(pedido)
})

export default router

