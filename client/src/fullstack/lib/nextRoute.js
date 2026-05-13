import { NextResponse } from "next/server";

import { invokeController } from "./invokeController.js";
import { requireAdmin } from "./requireAdmin.js";
import { requireAdminPrivilege } from "./requireAdminPrivilege.js";
import { resolveAuthUserId, resolveOptionalAuthUserId } from "./resolveAuthUserId.js";

function jsonError(message, status = 500) {
  return NextResponse.json(
    { message, error: true, success: false },
    { status }
  );
}

/** @param {(req: object, res: object) => Promise<void>} handler */
export function asPublicPost(handler, routeOpts = {}) {
  return async (request) => {
    try {
      const result = await invokeController(handler, request, routeOpts);
      return NextResponse.json(result.body, { status: result.status });
    } catch (e) {
      console.error(handler.name || "handler", e);
      return jsonError(e?.message || "Server error");
    }
  };
}

export function asPublicGet(handler) {
  return async (request) => {
    try {
      const result = await invokeController(handler, request, { body: {} });
      return NextResponse.json(result.body, { status: result.status });
    } catch (e) {
      console.error(handler.name || "handler", e);
      return jsonError(e?.message || "Server error");
    }
  };
}

export function asPublicGetWithParams(handler, routeOpts = {}) {
  return async (request, context) => {
    try {
      const params = await context.params;
      const result = await invokeController(handler, request, {
        ...routeOpts,
        body: {},
        routeParams: params,
      });
      return NextResponse.json(result.body, { status: result.status });
    } catch (e) {
      console.error(handler.name || "handler", e);
      return jsonError(e?.message || "Server error");
    }
  };
}

export function asAuthPost(handler, routeOpts = {}) {
  return async (request) => {
    const auth = resolveAuthUserId(request, { required: true });
    if (auth.error) {
      return NextResponse.json(auth.error.body, { status: auth.error.status });
    }
    try {
      const result = await invokeController(handler, request, {
        ...routeOpts,
        userId: auth.userId,
      });
      return NextResponse.json(result.body, { status: result.status });
    } catch (e) {
      console.error(handler.name || "handler", e);
      return jsonError(e?.message || "Server error");
    }
  };
}

export function asAuthGet(handler) {
  return async (request) => {
    const auth = resolveAuthUserId(request, { required: true });
    if (auth.error) {
      return NextResponse.json(auth.error.body, { status: auth.error.status });
    }
    try {
      const result = await invokeController(handler, request, {
        body: {},
        userId: auth.userId,
      });
      return NextResponse.json(result.body, { status: result.status });
    } catch (e) {
      console.error(handler.name || "handler", e);
      return jsonError(e?.message || "Server error");
    }
  };
}

export function asAuthPut(handler) {
  return async (request) => {
    const auth = resolveAuthUserId(request, { required: true });
    if (auth.error) {
      return NextResponse.json(auth.error.body, { status: auth.error.status });
    }
    try {
      const result = await invokeController(handler, request, {
        userId: auth.userId,
      });
      return NextResponse.json(result.body, { status: result.status });
    } catch (e) {
      console.error(handler.name || "handler", e);
      return jsonError(e?.message || "Server error");
    }
  };
}

export function asAuthDelete(handler) {
  return async (request) => {
    const auth = resolveAuthUserId(request, { required: true });
    if (auth.error) {
      return NextResponse.json(auth.error.body, { status: auth.error.status });
    }
    try {
      const result = await invokeController(handler, request, {
        userId: auth.userId,
      });
      return NextResponse.json(result.body, { status: result.status });
    } catch (e) {
      console.error(handler.name || "handler", e);
      return jsonError(e?.message || "Server error");
    }
  };
}

export function asAdminGet(handler) {
  return async (request) => {
    const admin = await requireAdmin(request);
    if (admin.error) {
      return NextResponse.json(admin.error.body, { status: admin.error.status });
    }
    try {
      const result = await invokeController(handler, request, {
        body: {},
        userId: admin.userId,
      });
      return NextResponse.json(result.body, { status: result.status });
    } catch (e) {
      console.error(handler.name || "handler", e);
      return jsonError(e?.message || "Server error");
    }
  };
}

export function asAdminPost(handler) {
  return async (request) => {
    const admin = await requireAdmin(request);
    if (admin.error) {
      return NextResponse.json(admin.error.body, { status: admin.error.status });
    }
    try {
      const result = await invokeController(handler, request, {
        userId: admin.userId,
      });
      return NextResponse.json(result.body, { status: result.status });
    } catch (e) {
      console.error(handler.name || "handler", e);
      return jsonError(e?.message || "Server error");
    }
  };
}

export function asAdminPut(handler) {
  return async (request) => {
    const admin = await requireAdmin(request);
    if (admin.error) {
      return NextResponse.json(admin.error.body, { status: admin.error.status });
    }
    try {
      const result = await invokeController(handler, request, {
        userId: admin.userId,
      });
      return NextResponse.json(result.body, { status: result.status });
    } catch (e) {
      console.error(handler.name || "handler", e);
      return jsonError(e?.message || "Server error");
    }
  };
}

export function asAdminDelete(handler) {
  return async (request) => {
    const admin = await requireAdmin(request);
    if (admin.error) {
      return NextResponse.json(admin.error.body, { status: admin.error.status });
    }
    try {
      const result = await invokeController(handler, request, {
        userId: admin.userId,
      });
      return NextResponse.json(result.body, { status: result.status });
    } catch (e) {
      console.error(handler.name || "handler", e);
      return jsonError(e?.message || "Server error");
    }
  };
}

export function asAdminPutWithParams(handler) {
  return async (request, context) => {
    const admin = await requireAdmin(request);
    if (admin.error) {
      return NextResponse.json(admin.error.body, { status: admin.error.status });
    }
    try {
      const params = await context.params;
      const result = await invokeController(handler, request, {
        userId: admin.userId,
        routeParams: params,
      });
      return NextResponse.json(result.body, { status: result.status });
    } catch (e) {
      console.error(handler.name || "handler", e);
      return jsonError(e?.message || "Server error");
    }
  };
}

export function asAdminDeleteWithParams(handler) {
  return async (request, context) => {
    const admin = await requireAdmin(request);
    if (admin.error) {
      return NextResponse.json(admin.error.body, { status: admin.error.status });
    }
    try {
      const params = await context.params;
      const result = await invokeController(handler, request, {
        userId: admin.userId,
        routeParams: params,
      });
      return NextResponse.json(result.body, { status: result.status });
    } catch (e) {
      console.error(handler.name || "handler", e);
      return jsonError(e?.message || "Server error");
    }
  };
}

export function asAdminPatchWithParams(handler) {
  return async (request, context) => {
    const admin = await requireAdmin(request);
    if (admin.error) {
      return NextResponse.json(admin.error.body, { status: admin.error.status });
    }
    try {
      const params = await context.params;
      const result = await invokeController(handler, request, {
        userId: admin.userId,
        routeParams: params,
      });
      return NextResponse.json(result.body, { status: result.status });
    } catch (e) {
      console.error(handler.name || "handler", e);
      return jsonError(e?.message || "Server error");
    }
  };
}

export function asAuthGetWithParams(handler, routeOpts = {}) {
  return async (request, context) => {
    const auth = resolveAuthUserId(request, { required: true });
    if (auth.error) {
      return NextResponse.json(auth.error.body, { status: auth.error.status });
    }
    try {
      const params = await context.params;
      const result = await invokeController(handler, request, {
        ...routeOpts,
        body: {},
        userId: auth.userId,
        routeParams: params,
      });
      return NextResponse.json(result.body, { status: result.status });
    } catch (e) {
      console.error(handler.name || "handler", e);
      return jsonError(e?.message || "Server error");
    }
  };
}

export function asAuthPostWithParams(handler, routeOpts = {}) {
  return async (request, context) => {
    const auth = resolveAuthUserId(request, { required: true });
    if (auth.error) {
      return NextResponse.json(auth.error.body, { status: auth.error.status });
    }
    try {
      const params = await context.params;
      const result = await invokeController(handler, request, {
        ...routeOpts,
        userId: auth.userId,
        routeParams: params,
      });
      return NextResponse.json(result.body, { status: result.status });
    } catch (e) {
      console.error(handler.name || "handler", e);
      return jsonError(e?.message || "Server error");
    }
  };
}

export function asAuthDeleteWithParams(handler) {
  return async (request, context) => {
    const auth = resolveAuthUserId(request, { required: true });
    if (auth.error) {
      return NextResponse.json(auth.error.body, { status: auth.error.status });
    }
    try {
      const params = await context.params;
      const result = await invokeController(handler, request, {
        userId: auth.userId,
        routeParams: params,
      });
      return NextResponse.json(result.body, { status: result.status });
    } catch (e) {
      console.error(handler.name || "handler", e);
      return jsonError(e?.message || "Server error");
    }
  };
}

export function asOptionalAuthGet(handler) {
  return async (request) => {
    try {
      const { userId } = resolveOptionalAuthUserId(request);
      const result = await invokeController(handler, request, {
        body: {},
        userId,
      });
      return NextResponse.json(result.body, { status: result.status });
    } catch (e) {
      console.error(handler.name || "handler", e);
      return jsonError(e?.message || "Server error");
    }
  };
}

export function asOptionalAuthGetWithParams(handler) {
  return async (request, context) => {
    try {
      const params = await context.params;
      const { userId } = resolveOptionalAuthUserId(request);
      const result = await invokeController(handler, request, {
        body: {},
        routeParams: params,
        userId,
      });
      return NextResponse.json(result.body, { status: result.status });
    } catch (e) {
      console.error(handler.name || "handler", e);
      return jsonError(e?.message || "Server error");
    }
  };
}

export function asOptionalAuthPost(handler) {
  return async (request) => {
    try {
      const { userId } = resolveOptionalAuthUserId(request);
      const result = await invokeController(handler, request, { userId });
      return NextResponse.json(result.body, { status: result.status });
    } catch (e) {
      console.error(handler.name || "handler", e);
      return jsonError(e?.message || "Server error");
    }
  };
}

export function asOptionalAuthDeleteWithParams(handler) {
  return async (request, context) => {
    try {
      const params = await context.params;
      const { userId } = resolveOptionalAuthUserId(request);
      const result = await invokeController(handler, request, {
        userId,
        routeParams: params,
      });
      return NextResponse.json(result.body, { status: result.status });
    } catch (e) {
      console.error(handler.name || "handler", e);
      return jsonError(e?.message || "Server error");
    }
  };
}

export function asAdminPrivilegeGet(handler) {
  return async (request) => {
    const gate = await requireAdminPrivilege(request);
    if (gate.error) {
      return NextResponse.json(gate.error.body, { status: gate.error.status });
    }
    try {
      const result = await invokeController(handler, request, {
        body: {},
        userId: gate.userId,
      });
      return NextResponse.json(result.body, { status: result.status });
    } catch (e) {
      console.error(handler.name || "handler", e);
      return jsonError(e?.message || "Server error");
    }
  };
}

export function asAdminPrivilegePost(handler) {
  return async (request) => {
    const gate = await requireAdminPrivilege(request);
    if (gate.error) {
      return NextResponse.json(gate.error.body, { status: gate.error.status });
    }
    try {
      const result = await invokeController(handler, request, {
        userId: gate.userId,
      });
      return NextResponse.json(result.body, { status: result.status });
    } catch (e) {
      console.error(handler.name || "handler", e);
      return jsonError(e?.message || "Server error");
    }
  };
}

export function asAdminPrivilegePutWithParams(handler) {
  return async (request, context) => {
    const gate = await requireAdminPrivilege(request);
    if (gate.error) {
      return NextResponse.json(gate.error.body, { status: gate.error.status });
    }
    try {
      const params = await context.params;
      const result = await invokeController(handler, request, {
        userId: gate.userId,
        routeParams: params,
      });
      return NextResponse.json(result.body, { status: result.status });
    } catch (e) {
      console.error(handler.name || "handler", e);
      return jsonError(e?.message || "Server error");
    }
  };
}

export function asAdminPrivilegeDeleteWithParams(handler) {
  return async (request, context) => {
    const gate = await requireAdminPrivilege(request);
    if (gate.error) {
      return NextResponse.json(gate.error.body, { status: gate.error.status });
    }
    try {
      const params = await context.params;
      const result = await invokeController(handler, request, {
        userId: gate.userId,
        routeParams: params,
      });
      return NextResponse.json(result.body, { status: result.status });
    } catch (e) {
      console.error(handler.name || "handler", e);
      return jsonError(e?.message || "Server error");
    }
  };
}
